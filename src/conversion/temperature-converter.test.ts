import { describe, expect, test } from "bun:test";
import { TemperatureConverter } from "./temperature-converter";

describe("TemperatureConverter", () => {
  describe("celsiusToFahrenheit", () => {
    [
      [0, 32],
      [10, 50],
      [15, 59],
      [20, 68],
      [30, 86],
    ].forEach(([celsius, fahrenheit]) => {
      test(`should convert ${celsius} C to ${fahrenheit} F`, () => {
        // Arrange & Act
        const result = TemperatureConverter.celsiusToFahrenheit(celsius);

        // Assert
        expect(result).toEqual(fahrenheit);
      });
    });
  });

  describe("fahrenheitToCelsius", () => {
    [
      [32, 0],
      [50, 10],
      [59, 15],
      [68, 20],
      [86, 30],
    ].forEach(([fahrenheit, celsius]) => {
      test(`should convert ${fahrenheit} f to ${celsius} c`, () => {
        // Arrange & Act
        const result = TemperatureConverter.fahrenheitToCelsius(fahrenheit);

        // Assert
        expect(result).toEqual(celsius);
      });
    });
  });

  describe("fahrenheitToCelsiusFanOven", () => {
    [
      [32, 0],
      [50, 9],
      [59, 13.5],
      [68, 18],
      [86, 27],
    ].forEach(([fahrenheit, celsiusFan]) => {
      test(`should convert ${fahrenheit} f to ${celsiusFan} c (fan)`, () => {
        // Arrange & Act
        const result =
          TemperatureConverter.fahrenheitToCelsiusFanOven(fahrenheit);

        // Assert
        expect(result).toEqual(celsiusFan);
      });
    });
  });

  describe("celsiusFanOvenToFahrenheit", () => {
    [
      [0, 32],
      [10, 52],
      [15, 62],
      [20, 72],
      [30, 92],
    ].forEach(([celsiusFan, fahrenheit]) => {
      test(`should convert ${celsiusFan} c (fan) to ${fahrenheit} f`, () => {
        // Arrange & Act
        const result =
          TemperatureConverter.celsiusFanOvenToFahrenheit(celsiusFan);

        // Assert
        expect(result).toEqual(fahrenheit);
      });
    });
  });
});
