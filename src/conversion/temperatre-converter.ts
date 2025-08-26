import { Decimal } from "decimal.js";

export class TemperatureConverter {
  private static readonly CELSIUS_TO_FAHRENHEIT = 1.8;
  private static readonly FAHRENHEIT_TO_CELSIUS = 0.5555555555555556;

  static celsiusToFahrenheit(celsius: number): number {
    return celsius * this.CELSIUS_TO_FAHRENHEIT + 32;
  }

  static fahrenheitToCelsius(fahrenheit: number): number {
    return (fahrenheit - 32) * this.FAHRENHEIT_TO_CELSIUS;
  }

  /**
   * American ovens don't tend to be fanned, whereas british ones are,
   * so requiring the temperature be adjusted by 10%.
   */
  static fahrenheitToCelsiusFanOven(fahrenheit: number): number {
    const celsius = new Decimal(this.fahrenheitToCelsius(fahrenheit));

    return celsius.mul(0.9).toNumber();
  }

  /**
   * American ovens don't tend to be fanned, whereas british ones are,
   * so requiring the temperature be adjusted by 10%.
   */
  static celsiusFanOvenToFahrenheit(celsiusFanOven: number): number {
    const celsius = new Decimal(celsiusFanOven).div(0.9);

    return this.celsiusToFahrenheit(celsius.toNumber());
  }
}
