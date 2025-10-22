import * as THREE from "three";

export class EnhancedOrbitControls {
  camera: THREE.PerspectiveCamera;
  domElement: HTMLElement;
  target: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  enableDamping: boolean = false;
  dampingFactor: number = 0.1;
  minDistance: number = 0.1;
  maxDistance: number = 1000;
  zoomSpeed: number = 1.0;

  private _onPointerDown?: (ev: PointerEvent) => void;
  private _onPointerMove?: (ev: PointerEvent) => void;
  private _onPointerUp?: (ev: PointerEvent) => void;
  private _onWheel?: (ev: WheelEvent) => void;
  private _isPointerDown: boolean = false;
  private _previousPointerPosition = { x: 0, y: 0 };

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.camera = camera;
    this.domElement = domElement;

    this._onPointerDown = (ev: PointerEvent) => {
      (ev.target as Element).setPointerCapture?.(ev.pointerId);
      this._isPointerDown = true;
      this.domElement.style.cursor = "grabbing";
      this._previousPointerPosition.x = ev.clientX;
      this._previousPointerPosition.y = ev.clientY;
    };

    this._onPointerMove = (ev: PointerEvent) => {
      if (!this._isPointerDown) return;
      
      const deltaX = ev.clientX - this._previousPointerPosition.x;
      const deltaY = ev.clientY - this._previousPointerPosition.y;

      // Rotate around target
      const offset = new THREE.Vector3().copy(this.camera.position).sub(this.target);
      const spherical = new THREE.Spherical().setFromVector3(offset);
      
      spherical.theta -= deltaX * 0.01;
      spherical.phi = Math.max(0.01, Math.min(Math.PI - 0.01, spherical.phi - deltaY * 0.01));
      
      offset.setFromSpherical(spherical);
      this.camera.position.copy(this.target).add(offset);
      this.camera.lookAt(this.target);

      this._previousPointerPosition.x = ev.clientX;
      this._previousPointerPosition.y = ev.clientY;
    };

    this._onPointerUp = (ev: PointerEvent) => {
      this._isPointerDown = false;
      this.domElement.style.cursor = "grab";
      (ev.target as Element).releasePointerCapture?.(ev.pointerId);
    };

    this._onWheel = (ev: WheelEvent) => {
      ev.preventDefault();
      
      const delta = ev.deltaY * 0.01;
      const direction = new THREE.Vector3().subVectors(this.camera.position, this.target).normalize();
      const distance = this.camera.position.distanceTo(this.target);
      
      let newDistance = distance * (1 + delta * this.zoomSpeed);
      newDistance = Math.max(this.minDistance, Math.min(this.maxDistance, newDistance));
      
      this.camera.position.copy(this.target).add(direction.multiplyScalar(newDistance));
    };

    this.domElement.addEventListener("pointerdown", this._onPointerDown);
    this.domElement.addEventListener("pointermove", this._onPointerMove);
    this.domElement.addEventListener("pointerup", this._onPointerUp);
    this.domElement.addEventListener("pointercancel", this._onPointerUp);
    this.domElement.addEventListener("wheel", this._onWheel, { passive: false });
  }

  update() {
    if (this.enableDamping && this.dampingFactor > 0) {
      // Simple damping implementation
      const desired = new THREE.Vector3().copy(this.camera.position);
      const current = new THREE.Vector3().copy(this.camera.position);
      current.lerp(desired, 1 - Math.exp(-this.dampingFactor));
      this.camera.position.copy(current);
      this.camera.lookAt(this.target);
    }
    this.camera.lookAt(this.target);
  }

  dispose() {
    if (this._onPointerDown) this.domElement.removeEventListener("pointerdown", this._onPointerDown);
    if (this._onPointerMove) this.domElement.removeEventListener("pointermove", this._onPointerMove);
    if (this._onPointerUp) {
      this.domElement.removeEventListener("pointerup", this._onPointerUp);
      this.domElement.removeEventListener("pointercancel", this._onPointerUp);
    }
    if (this._onWheel) this.domElement.removeEventListener("wheel", this._onWheel);
  }
}