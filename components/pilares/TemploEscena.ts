import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { GTAOPass } from "three/examples/jsm/postprocessing/GTAOPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { COLOR } from "../marca";
import {
  ALTURA_COLUMNA,
  ALTURA_TAMBOR,
  COTA_ESTILOBATO,
  MEDIDAS,
  xColumna,
} from "./medidas";
import {
  bloque,
  crearBasamento,
  crearCapitel,
  crearEntablamento,
  crearTambor,
} from "./templo-geometria";

export type EstadoTemplo = {
  // Por columna, 0 = nada colocado, 1 = 4 tambores + capitel en su sitio.
  construccion: number[];
  // Por columna, 0 = apagada, 1 = encendida de abajo arriba.
  encendido: number[];
  // 0 = sin entablamento, 1 = frontón colocado y rótulo encendido.
  fronton: number;
};

type Pieza = {
  solido: THREE.Object3D;
  alambre: THREE.Object3D;
  materiales: THREE.MeshStandardMaterial[];
  lineas: THREE.LineBasicMaterial;
  yFinal: number;
  caida: number;
  transparente: boolean;
};

type Columna = {
  piezas: Pieza[];
  uniforms: { uEncendido: { value: number }; uColorBrillo: { value: THREE.Color } };
  foco: THREE.SpotLight;
  lente: THREE.MeshStandardMaterial;
};

// Texturas PBR CC0 de Poly Haven ("Marble Cliff 05", Amal Kumar).
const TEXTURAS = {
  color: "/assets/templo/piedra_color.jpg",
  normal: "/assets/templo/piedra_normal.jpg",
  arm: "/assets/templo/piedra_arm.jpg",
};

const TINTE_PIEDRA = 0xf1e9dc;
const PIEZAS_POR_COLUMNA = MEDIDAS.tambores + 1;
const Z_FOCO = 0.95;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const suavizar = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const salida = (t: number) => 1 - Math.pow(1 - t, 3);

const VinetaGrano = {
  uniforms: {
    tDiffuse: { value: null },
    uTiempo: { value: 0 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTiempo;
    varying vec2 vUv;
    float azar(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233)) + uTiempo) * 43758.5453); }
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      vec2 d = vUv - 0.5;
      c.rgb *= 1.0 - smoothstep(0.35, 0.85, length(d * vec2(1.0, 0.8))) * 0.75;
      c.rgb += (azar(vUv * 900.0) - 0.5) * 0.035;
      gl_FragColor = c;
    }`,
};

export class TemploEscena {
  readonly renderer: THREE.WebGLRenderer;
  readonly camera: THREE.PerspectiveCamera;
  readonly listo: Promise<void>;
  private scene = new THREE.Scene();
  private composer?: EffectComposer;
  private grano?: ShaderPass;
  private ultimoTiempo = 0;
  private columnas: Columna[] = [];
  private fronton!: Pieza;
  private materialRotulo!: THREE.MeshStandardMaterial;
  private polvo?: THREE.Points;
  private desechables: { dispose: () => void }[] = [];
  private visible = false;

  // colores: color de la luz de cada columna, en el orden de los pilares.
  constructor(canvas: HTMLCanvasElement, opciones: { movil: boolean; colores: string[] }) {
    const { movil, colores } = opciones;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !movil,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.setClearColor(COLOR.fondo, 1);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.shadowMap.enabled = !movil;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    this.scene.fog = new THREE.FogExp2(COLOR.fondo, 0.03);
    this.camera = new THREE.PerspectiveCamera(30, 16 / 9, 0.1, 100);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const entorno = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = entorno;
    this.scene.environmentIntensity = 0.1;
    pmrem.dispose();
    this.desechables.push(entorno);

    let resolver!: () => void;
    this.listo = new Promise((r) => (resolver = r));
    const cargador = new THREE.TextureLoader(new THREE.LoadingManager(() => resolver()));
    const anisotropia = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    const cargar = (url: string, srgb: boolean) => {
      const t = cargador.load(url);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.anisotropy = anisotropia;
      if (srgb) t.colorSpace = THREE.SRGBColorSpace;
      this.desechables.push(t);
      return t;
    };
    const tex = {
      color: cargar(TEXTURAS.color, true),
      normal: cargar(TEXTURAS.normal, false),
      arm: cargar(TEXTURAS.arm, false),
    };
    // La textura es de roca natural: se le baja el contraste para que se lea
    // como mármol tallado y envejecido, no como acantilado.
    const piedra = () => {
      const m = new THREE.MeshStandardMaterial({
        color: TINTE_PIEDRA,
        map: tex.color,
        normalMap: tex.normal,
        normalScale: new THREE.Vector2(0.4, 0.4),
        roughnessMap: tex.arm,
        aoMap: tex.arm,
        aoMapIntensity: 0.6,
        roughness: 1,
        metalness: 0,
      });
      m.onBeforeCompile = (shader) => {
        shader.fragmentShader = shader.fragmentShader.replace(
          "#include <map_fragment>",
          `#include <map_fragment>
          float lumPiedra = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(lumPiedra) * vec3(1.04, 1.0, 0.93), 0.35);
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.6, 0.56, 0.5), 0.3);`,
        );
      };
      return m;
    };

    this.montarLuces(movil);

    const suelo = new THREE.Mesh(
      new THREE.PlaneGeometry(90, 90),
      new THREE.MeshStandardMaterial({ color: 0x0d0c0b, roughness: 1 }),
    );
    suelo.rotation.x = -Math.PI / 2;
    suelo.receiveShadow = true;
    this.scene.add(suelo);

    const basamento = crearBasamento(piedra());
    this.sombras(basamento);
    this.scene.add(basamento);

    const estrias = 20;
    const materialFoco = new THREE.MeshStandardMaterial({
      color: 0x161514,
      metalness: 0.7,
      roughness: 0.45,
    });

    for (let c = 0; c < MEDIDAS.columnas; c++) {
      const color = colores[c] ?? COLOR.acento;
      const uniforms = {
        uEncendido: { value: 0 },
        uColorBrillo: { value: new THREE.Color(color) },
      };
      const piezas: Pieza[] = [];

      for (let k = 0; k < PIEZAS_POR_COLUMNA; k++) {
        const material = this.materialColumna(piedra(), uniforms);
        let solido: THREE.Object3D;
        if (k < MEDIDAS.tambores) {
          const geo = crearTambor(k, estrias, c * 7 + k * 3 + 1);
          this.desechables.push(geo);
          solido = new THREE.Mesh(geo, material);
          solido.rotation.y = ((c * 5 + k) % 7) * 0.9;
        } else {
          solido = crearCapitel(material);
        }
        const yFinal = COTA_ESTILOBATO + k * ALTURA_TAMBOR;
        solido.position.set(xColumna(c), yFinal, 0);
        this.sombras(solido);
        this.scene.add(solido);
        piezas.push(this.crearPieza(solido, [material], yFinal, 2.6 + k * 0.35, color));
      }

      // Proyector empotrado al pie de la columna, como en un monumento real.
      const carcasa = bloque(0.3, 0.09, 0.2, materialFoco, 0);
      carcasa.position.set(xColumna(c), COTA_ESTILOBATO + 0.045, Z_FOCO);
      const lente = new THREE.MeshStandardMaterial({
        color: 0x222222,
        emissive: color,
        emissiveIntensity: 0,
      });
      const cristal = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.14), lente);
      cristal.rotation.x = -Math.PI / 2;
      cristal.position.set(xColumna(c), COTA_ESTILOBATO + 0.092, Z_FOCO);
      this.scene.add(carcasa, cristal);

      const foco = new THREE.SpotLight(color, 0, 0, 0.36, 1, 1.6);
      foco.position.set(xColumna(c), COTA_ESTILOBATO + 0.1, Z_FOCO);
      foco.target.position.set(xColumna(c), COTA_ESTILOBATO + ALTURA_COLUMNA * 1.3, -0.35);
      this.scene.add(foco, foco.target);

      this.columnas.push({ piezas, uniforms, foco, lente });
    }

    this.materialRotulo = this.materialTimpano(piedra());
    const materialEntablamento = piedra();
    const entablamento = crearEntablamento(materialEntablamento, this.materialRotulo);
    const yEntablamento = COTA_ESTILOBATO + ALTURA_COLUMNA;
    entablamento.grupo.position.y = yEntablamento;
    this.sombras(entablamento.grupo);
    this.scene.add(entablamento.grupo);
    this.fronton = this.crearPieza(
      entablamento.grupo,
      [materialEntablamento, this.materialRotulo],
      yEntablamento,
      4.5,
    );

    if (!movil) {
      this.polvo = this.crearPolvo();
      this.montarPostproceso();
    }

    this.aplicarEstado({
      construccion: Array(MEDIDAS.columnas).fill(1),
      encendido: Array(MEDIDAS.columnas).fill(0),
      fronton: 1,
    });
  }

  private sombras(o: THREE.Object3D) {
    o.traverse((h) => {
      h.castShadow = true;
      h.receiveShadow = true;
    });
  }

  private montarLuces(movil: boolean) {
    // Luna: fría, alta y lateral. Modela el volumen cuando nada está encendido.
    const luna = new THREE.DirectionalLight(0xaec3e6, 1.5);
    luna.position.set(-10, 14, 7);
    if (!movil) {
      luna.castShadow = true;
      luna.shadow.mapSize.set(2048, 2048);
      const s = luna.shadow.camera;
      s.left = -9;
      s.right = 9;
      s.top = 10;
      s.bottom = -4;
      s.near = 1;
      s.far = 45;
      luna.shadow.bias = -0.0003;
      luna.shadow.normalBias = 0.025;
      luna.shadow.radius = 3;
    }
    this.scene.add(luna);

    // Rebote cálido y tenue desde el lado contrario, para que la sombra no sea negra.
    const rebote = new THREE.DirectionalLight(0xffc89a, 0.35);
    rebote.position.set(9, 3, 6);
    this.scene.add(rebote);

    this.scene.add(new THREE.HemisphereLight(0x46505e, 0x000000, 0.25));
  }

  private montarPostproceso() {
    const rt = new THREE.WebGLRenderTarget(1, 1, {
      type: THREE.HalfFloatType,
      samples: 4,
    });
    const composer = new EffectComposer(this.renderer, rt);
    composer.addPass(new RenderPass(this.scene, this.camera));

    const gtao = new GTAOPass(this.scene, this.camera, 1, 1);
    gtao.updateGtaoMaterial({ radius: 0.35, distanceExponent: 1.4, thickness: 1, scale: 1.1, samples: 16 });
    gtao.blendIntensity = 0.9;
    composer.addPass(gtao);

    composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.32, 0.55, 0.82));
    composer.addPass(new OutputPass());

    this.grano = new ShaderPass(VinetaGrano);
    composer.addPass(this.grano);
    this.composer = composer;
  }

  // Encendido que sube desde la base. Imita el rebote del proyector en la
  // piedra; la luz directa la pone el SpotLight de cada columna.
  private materialColumna(
    material: THREE.MeshStandardMaterial,
    uniforms: Columna["uniforms"],
  ) {
    const base = material.onBeforeCompile.bind(material);
    material.onBeforeCompile = (shader, renderer) => {
      base(shader, renderer);
      shader.uniforms.uEncendido = uniforms.uEncendido;
      shader.uniforms.uColorBrillo = uniforms.uColorBrillo;
      shader.uniforms.uBase = { value: COTA_ESTILOBATO };
      shader.uniforms.uAlto = { value: ALTURA_COLUMNA };
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying float vAltura;")
        .replace(
          "#include <worldpos_vertex>",
          "#include <worldpos_vertex>\nvAltura = (modelMatrix * vec4(transformed, 1.0)).y;",
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          "#include <common>\nvarying float vAltura;\nuniform float uEncendido;\nuniform vec3 uColorBrillo;\nuniform float uBase;\nuniform float uAlto;",
        )
        .replace(
          "#include <emissivemap_fragment>",
          `#include <emissivemap_fragment>
          float hRel = clamp((vAltura - uBase) / uAlto, 0.0, 1.0);
          float frente = uEncendido * 1.2;
          float barrido = 1.0 - smoothstep(frente - 0.2, frente, hRel);
          float caidaLuz = pow(1.0 - hRel, 2.4) * 0.9 + 0.03;
          vec3 tono = mix(uColorBrillo, uColorBrillo * 0.45 + 0.55, (1.0 - hRel) * 0.6);
          totalEmissiveRadiance += tono * diffuseColor.rgb * barrido * caidaLuz * 0.8;`,
        );
    };
    material.customProgramCacheKey = () => "columna-encendido";
    return material;
  }

  // Tímpano: misma piedra, con "THE RESET" tallado (más oscuro) y una máscara
  // de brillo para encender las letras al final.
  private materialTimpano(material: THREE.MeshStandardMaterial) {
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 236;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = `700 ${Math.round(canvas.height * 0.36)}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.textAlign = "center";
    if ("letterSpacing" in ctx) ctx.letterSpacing = `${Math.round(canvas.height * 0.06)}px`;
    ctx.fillText("THE RESET", canvas.width / 2, canvas.height * 0.62);

    const mascara = new THREE.CanvasTexture(canvas);
    mascara.channel = 1;
    mascara.anisotropy = 4;
    this.desechables.push(mascara);

    material.emissive = new THREE.Color(COLOR.acento);
    material.emissiveMap = mascara;
    material.emissiveIntensity = 0;
    const base = material.onBeforeCompile.bind(material);
    material.onBeforeCompile = (shader, renderer) => {
      base(shader, renderer);
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <emissivemap_fragment>",
        `diffuseColor.rgb *= 1.0 - 0.6 * texture2D(emissiveMap, vEmissiveMapUv).r;
        #include <emissivemap_fragment>`,
      );
    };
    material.customProgramCacheKey = () => "timpano-rotulo";
    return material;
  }

  private crearPieza(
    solido: THREE.Object3D,
    materiales: THREE.MeshStandardMaterial[],
    yFinal: number,
    caida: number,
    colorLineas: THREE.ColorRepresentation = COLOR.acento,
  ): Pieza {
    const lineas = new THREE.LineBasicMaterial({
      color: colorLineas,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const alambre = new THREE.Group();
    solido.updateMatrixWorld(true);
    const inversa = solido.matrixWorld.clone().invert();
    solido.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return;
      const aristas = new THREE.EdgesGeometry(o.geometry, 30);
      this.desechables.push(aristas);
      const seg = new THREE.LineSegments(aristas, lineas);
      seg.applyMatrix4(inversa.clone().multiply(o.matrixWorld));
      alambre.add(seg);
    });
    alambre.position.copy(solido.position);
    alambre.rotation.copy(solido.rotation);
    this.scene.add(alambre);
    return { solido, alambre, materiales, lineas, yFinal, caida, transparente: false };
  }

  // f: 0 = fuera de escena, 1 = colocada. Cae desde arriba como alambre y se
  // solidifica al encajar.
  private aplicarPieza(p: Pieza, f: number) {
    const visible = f > 0.001;
    p.solido.visible = visible && f > 0.45;
    p.alambre.visible = visible && f < 0.999;
    if (!visible) return;

    const y = p.yFinal + (1 - salida(f)) * p.caida;
    p.solido.position.y = y;
    p.alambre.position.y = y;

    p.lineas.opacity = suavizar(0, 0.2, f) * (1 - suavizar(0.75, 1, f)) * 0.9;

    const opacidad = suavizar(0.45, 0.95, f);
    const transparente = opacidad < 0.999;
    if (transparente !== p.transparente) {
      p.transparente = transparente;
      p.materiales.forEach((m) => {
        m.transparent = transparente;
        m.needsUpdate = true;
      });
    }
    p.materiales.forEach((m) => {
      m.opacity = opacidad;
    });
  }

  aplicarEstado(e: EstadoTemplo) {
    this.columnas.forEach((col, c) => {
      const construccion = clamp01(e.construccion[c] ?? 0);
      col.piezas.forEach((pieza, k) => {
        this.aplicarPieza(pieza, clamp01(construccion * PIEZAS_POR_COLUMNA - k));
      });
      const encendido = clamp01(e.encendido[c] ?? 0);
      col.uniforms.uEncendido.value = encendido;
      const potencia = suavizar(0, 0.5, encendido);
      col.foco.intensity = potencia * 30;
      col.lente.emissiveIntensity = potencia * 6;
    });
    const fronton = clamp01(e.fronton);
    this.aplicarPieza(this.fronton, fronton);
    this.materialRotulo.emissiveIntensity = suavizar(0.85, 1, fronton) * 1.6;
  }

  setCamara(posicion: THREE.Vector3Like, objetivo: THREE.Vector3Like) {
    this.camera.position.set(posicion.x, posicion.y, posicion.z);
    this.camera.lookAt(objetivo.x, objetivo.y, objetivo.z);
    // Niebla relativa a la distancia: al alejar la cámara (móvil, plano final)
    // el templo no debe fundirse con el fondo.
    const distancia = Math.hypot(
      posicion.x - objetivo.x,
      posicion.y - objetivo.y,
      posicion.z - objetivo.z,
    );
    (this.scene.fog as THREE.FogExp2).density = Math.min(0.03, 0.5 / distancia);
  }

  // desplX/desplY: fracción del lienzo que se mueve el centro de la escena
  // (positivo = derecha / abajo), para dejar sitio al texto sin mover la cámara.
  resize(ancho: number, alto: number, desplX = 0, desplY = 0) {
    if (!ancho || !alto) return;
    this.renderer.setSize(ancho, alto, false);
    this.composer?.setPixelRatio(this.renderer.getPixelRatio());
    this.composer?.setSize(ancho, alto);
    this.camera.aspect = ancho / alto;
    if (desplX || desplY) {
      this.camera.setViewOffset(ancho, alto, -desplX * ancho, -desplY * alto, ancho, alto);
    } else {
      this.camera.clearViewOffset();
    }
    this.camera.updateProjectionMatrix();
  }

  setVisible(visible: boolean) {
    if (visible === this.visible) return;
    this.visible = visible;
    this.ultimoTiempo = 0;
    this.renderer.setAnimationLoop(visible ? (t) => this.fotograma(t) : null);
  }

  renderizar() {
    if (this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
  }

  private fotograma(tiempo: number) {
    const dt = this.ultimoTiempo ? Math.min((tiempo - this.ultimoTiempo) / 1000, 0.1) : 0;
    this.ultimoTiempo = tiempo;
    if (this.grano) this.grano.uniforms.uTiempo.value = (tiempo / 1000) % 100;
    if (this.polvo) {
      const pos = this.polvo.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) + dt * 0.1;
        if (y > 9) y = 0.2;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
    }
    this.renderizar();
  }

  private crearPolvo() {
    const n = 220;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = Math.random() * 9;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const polvo = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        color: 0xffd2a8,
        size: 0.022,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    this.scene.add(polvo);
    return polvo;
  }

  dispose() {
    this.renderer.setAnimationLoop(null);
    this.scene.traverse((o) => {
      if (o instanceof THREE.Mesh || o instanceof THREE.Points || o instanceof THREE.LineSegments) {
        o.geometry.dispose();
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => m.dispose());
      }
    });
    this.desechables.forEach((d) => d.dispose());
    this.composer?.dispose();
    this.renderer.dispose();
  }
}
