import { Decimal } from "decimal.js";

export class MassConverter {
  private static readonly GRAMS_TO_OUNCES = new Decimal(0.035274);
  private static readonly KILOGRAMS_TO_POUNDS = new Decimal(2.20462);

  static kilogramsToPounds(kilos: number): number {
    const result = new Decimal(kilos).mul(this.KILOGRAMS_TO_POUNDS);

    return Number(result.toFixed(2));
  }

  static poundsToKilograms(pounds: number): number {
    const result = new Decimal(pounds).div(this.KILOGRAMS_TO_POUNDS);

    return Number(result.toFixed(2));
  }

  static gramsToOunces(grams: number): number {
    const result = new Decimal(grams).mul(this.GRAMS_TO_OUNCES);

    return Number(result.toFixed(2));
  }

  static ouncesToGrams(ounces: number): number {
    const result = new Decimal(ounces).div(this.GRAMS_TO_OUNCES);

    return Number(result.toFixed(2));
  }
}
