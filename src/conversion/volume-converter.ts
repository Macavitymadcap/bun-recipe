import { Decimal } from "decimal.js";

export class VolumeConverter {
  private static readonly MILLILITRE_TO_FLUID_OUNCE = new Decimal(0.033814);
  private static readonly LITRE_TO_GALLON = new Decimal(0.264172);
  private static readonly MILLILITRE_TO_PINT = new Decimal(0.00176);

  static millilitresToFluidOunces(millilitres: number): number {
    const result = new Decimal(millilitres).mul(this.MILLILITRE_TO_FLUID_OUNCE);

    return Number(result.toFixed(2));
  }

  static fluidOuncesToMillilitres(fluidOunces: number): number {
    const result = new Decimal(fluidOunces).div(this.MILLILITRE_TO_FLUID_OUNCE);

    return Number(result.toFixed(2));
  }

  static litresToGallons(litres: number): number {
    const result = new Decimal(litres).mul(this.LITRE_TO_GALLON);

    return Number(result.toFixed(2));
  }

  static gallonsToLitres(gallons: number): number {
    const result = new Decimal(gallons).div(this.LITRE_TO_GALLON);

    return Number(result.toFixed(2));
  }

  static millilitresToPints(millilitres: number): number {
    const result = new Decimal(millilitres).mul(this.MILLILITRE_TO_PINT);

    return Number(result.toFixed(2));
  }

  static pintsToMillilitres(pints: number): number {
    const result = new Decimal(pints).div(this.MILLILITRE_TO_PINT);

    return Number(result.toFixed(2));
  }
}
