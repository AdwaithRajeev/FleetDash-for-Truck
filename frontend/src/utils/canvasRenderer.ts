// frontend/src/components/CanvasRenderer.ts

import type { Vehicle } from "../components/VehicleList";

interface RenderPosition {
  x: number;
  y: number;
}

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;

  private ctx: CanvasRenderingContext2D;

  private pendingVehicles: Vehicle[] = [];

  private positions =
    new Map<string, RenderPosition>();

  private activeIds =
    new Set<string>();

  private animationSpeed = 0.12;

  private animationFrameId:
    number | null = null;

  private destroyed = false;

  constructor(
    canvas: HTMLCanvasElement
  ) {
    this.canvas = canvas;

    const context =
      canvas.getContext("2d");

    if (!context) {
      throw new Error(
        "Canvas 2D context not supported"
      );
    }

    this.ctx = context;
  }

  /**
   * Resize canvas for high-DPI displays.
   */
  resize(): void {
    const rect =
      this.canvas.getBoundingClientRect();

    const dpr =
      window.devicePixelRatio || 1;

    const width =
      Math.max(1, rect.width);

    const height =
      Math.max(1, rect.height);

    this.canvas.width =
      Math.round(width * dpr);

    this.canvas.height =
      Math.round(height * dpr);

    this.canvas.style.width =
      `${width}px`;

    this.canvas.style.height =
      `${height}px`;

    this.ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );
  }

  /**
   * Clear visible canvas.
   */
  clear(): void {
    const width =
      this.canvas.clientWidth;

    const height =
      this.canvas.clientHeight;

    this.ctx.clearRect(
      0,
      0,
      width,
      height
    );
  }

  /**
   * Get vehicle color.
   *
   * Green = Moving
   * Red   = Offline
   */
  private getVehicleColor(
    status: Vehicle["status"]
  ): string {
    switch (status) {
      case "Moving":
        return "#31D67B";

      case "Offline":
        return "#FF5C5C";

      default:
        return "#FF5C5C";
    }
  }

  /**
   * Draw a vehicle-style map pin.
   */
  private drawVehicle(
    vehicle: Vehicle,
    x: number,
    y: number
  ): void {
    const color =
      this.getVehicleColor(
        vehicle.status
      );

    const vehicleId =
      String(vehicle.vehicleId);

    const ctx = this.ctx;

    /*
     * ─────────────────────────────────────
     * OUTER GLOW
     * ─────────────────────────────────────
     */

    ctx.save();

    ctx.beginPath();

    ctx.arc(
      x,
      y - 4,
      18,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      `${color}22`;

    ctx.fill();

    ctx.restore();

    /*
     * ─────────────────────────────────────
     * MAP PIN
     * ─────────────────────────────────────
     */

    ctx.save();

    /*
     * Move to vehicle position.
     */
    ctx.translate(
      x,
      y
    );

    /*
     * Rotate pin so it points downward.
     */
    ctx.rotate(
      Math.PI / 4
    );

    /*
     * Main pin shape.
     */
    ctx.beginPath();

    ctx.arc(
      0,
      0,
      13,
      0,
      Math.PI * 2
    );

    ctx.lineTo(
      13,
      13
    );

    ctx.lineTo(
      0,
      22
    );

    ctx.lineTo(
      -13,
      13
    );

    ctx.closePath();

    ctx.fillStyle =
      color;

    ctx.shadowColor =
      "rgba(0,0,0,0.35)";

    ctx.shadowBlur =
      5;

    ctx.shadowOffsetY =
      2;

    ctx.fill();

    /*
     * White border.
     */
    ctx.shadowColor =
      "transparent";

    ctx.strokeStyle =
      "#ffffff";

    ctx.lineWidth =
      2;

    ctx.stroke();

    ctx.restore();

    /*
     * ─────────────────────────────────────
     * VEHICLE NUMBER
     * ─────────────────────────────────────
     */

    ctx.save();

    ctx.font =
      "700 8px Arial";

    ctx.textAlign =
      "center";

    ctx.textBaseline =
      "middle";

    /*
     * Keep text inside marker.
     */
    let displayId =
      vehicleId;

    if (displayId.length > 8) {
      displayId =
        `${displayId.slice(0, 7)}…`;
    }

    /*
     * White text.
     */
    ctx.fillStyle =
      "#ffffff";

    ctx.fillText(
      displayId,
      x,
      y - 4
    );

    ctx.restore();
  }

  /**
   * Receive newest vehicle data.
   *
   * Drawing is handled by
   * requestAnimationFrame.
   */
  render(
    vehicles: Vehicle[]
  ): void {
    if (this.destroyed) {
      return;
    }

    /*
     * Always keep newest data.
     */
    this.pendingVehicles =
      vehicles;

    /*
     * Animation already running.
     */
    if (
      this.animationFrameId !== null
    ) {
      return;
    }

    const animate =
      (): void => {
        if (this.destroyed) {
          return;
        }

        this.drawVehicles(
          this.pendingVehicles
        );

        this.animationFrameId =
          requestAnimationFrame(
            animate
          );
      };

    animate();
  }

  /**
   * Draw all vehicles efficiently.
   */
  private drawVehicles(
    vehicles: Vehicle[]
  ): void {
    this.clear();

    if (
      vehicles.length === 0
    ) {
      return;
    }

    const width =
      this.canvas.clientWidth;

    const height =
      this.canvas.clientHeight;

    if (
      width <= 0 ||
      height <= 0
    ) {
      return;
    }

    /*
     * Find coordinate bounds.
     */
    let minLat =
      Infinity;

    let maxLat =
      -Infinity;

    let minLng =
      Infinity;

    let maxLng =
      -Infinity;

    for (
      let i = 0;
      i < vehicles.length;
      i++
    ) {
      const vehicle =
        vehicles[i];

      const latitude =
        Number(
          vehicle.latitude
        );

      const longitude =
        Number(
          vehicle.longitude
        );

      if (
        !Number.isFinite(
          latitude
        ) ||
        !Number.isFinite(
          longitude
        )
      ) {
        continue;
      }

      if (
        latitude < minLat
      ) {
        minLat =
          latitude;
      }

      if (
        latitude > maxLat
      ) {
        maxLat =
          latitude;
      }

      if (
        longitude < minLng
      ) {
        minLng =
          longitude;
      }

      if (
        longitude > maxLng
      ) {
        maxLng =
          longitude;
      }
    }

    /*
     * No valid coordinates.
     */
    if (
      minLat === Infinity ||
      minLng === Infinity
    ) {
      return;
    }

    const latRange =
      maxLat - minLat || 1;

    const lngRange =
      maxLng - minLng || 1;

    /*
     * Reuse active ID set.
     */
    this.activeIds.clear();

    /*
     * Draw every vehicle.
     */
    for (
      let i = 0;
      i < vehicles.length;
      i++
    ) {
      const vehicle =
        vehicles[i];

      const latitude =
        Number(
          vehicle.latitude
        );

      const longitude =
        Number(
          vehicle.longitude
        );

      if (
        !Number.isFinite(
          latitude
        ) ||
        !Number.isFinite(
          longitude
        )
      ) {
        continue;
      }

      const vehicleId =
        String(
          vehicle.vehicleId
        );

      this.activeIds.add(
        vehicleId
      );

      /*
       * Longitude -> X.
       */
      const leftPercent =
        (
          (longitude - minLng) /
          lngRange
        ) *
          84 +
        8;

      /*
       * Latitude -> Y.
       *
       * Latitude is inverted because
       * Canvas Y increases downward.
       */
      const topPercent =
        (
          (maxLat - latitude) /
          latRange
        ) *
          76 +
        10;

      const targetX =
        (
          leftPercent / 100
        ) *
        width;

      const targetY =
        (
          topPercent / 100
        ) *
        height;

      /*
       * Previous animated position.
       */
      let current =
        this.positions.get(
          vehicleId
        );

      /*
       * First appearance.
       */
      if (!current) {
        current = {
          x: targetX,
          y: targetY,
        };

        this.positions.set(
          vehicleId,
          current
        );
      } else {
        /*
         * Smooth interpolation.
         */
        current.x +=
          (
            targetX -
            current.x
          ) *
          this.animationSpeed;

        current.y +=
          (
            targetY -
            current.y
          ) *
          this.animationSpeed;
      }

      /*
       * Draw vehicle pin.
       */
      this.drawVehicle(
        vehicle,
        current.x,
        current.y
      );
    }

    /*
     * Remove vehicles that no
     * longer exist.
     */
    for (
      const id of this.positions.keys()
    ) {
      if (
        !this.activeIds.has(id)
      ) {
        this.positions.delete(
          id
        );
      }
    }
  }

  /**
   * Stop animation and release resources.
   */
  destroy(): void {
    this.destroyed =
      true;

    if (
      this.animationFrameId !== null
    ) {
      cancelAnimationFrame(
        this.animationFrameId
      );

      this.animationFrameId =
        null;
    }

    this.positions.clear();

    this.activeIds.clear();

    this.pendingVehicles = [];
  }
}