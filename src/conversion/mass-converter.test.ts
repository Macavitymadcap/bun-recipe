import { describe, expect, test } from "bun:test";
import { MassConverter } from "./mass-converter";

describe("MassConverter", () => {
  describe("kilogramsToPounds", () => {
    [
      [1, 2.2],
      [10, 22.05],
      [20, 44.09],
      [30, 66.14],
    ].forEach(([kilogram, pound]) => {
      test(`should convert ${kilogram} kg to ${pound} lbs`, () => {
        // Arrange & Act
        const result = MassConverter.kilogramsToPounds(kilogram);

        // Assert
        expect(result).toEqual(pound);
      });
    });
  });

  describe("poundsToKilograms", () => {
    [
      [1, 0.45],
      [10, 4.54],
      [20, 9.07],
      [30, 13.61],
    ].forEach(([pound, kilogram]) => {
      test(`should convert ${pound} lbs to ${kilogram} kg`, () => {
        // Arrange & Act
        const result = MassConverter.poundsToKilograms(pound);

        // Assert
        expect(result).toEqual(kilogram);
      });
    });
  });

  describe("gramsToOunces", () => {
    [
      [1, 0.04],
      [10, 0.35],
      [20, 0.71],
      [30, 1.06],
    ].forEach(([gram, ounce]) => {
      test(`shoudl convert ${gram} g to ${ounce} oz`, () => {
        // Arrange & Act
        const result = MassConverter.gramsToOunces(gram);

        // Assert
        expect(result).toEqual(ounce);
      });
    });
  });

  describe("ouncesToGrams", () => {
    [
      [1, 28.35],
      [10, 283.49],
      [20, 566.99],
      [30, 850.48],
    ].forEach(([ounce, gram]) => {
      test(`should convert ${ounce} oz to ${gram} g`, () => {
        // Arrange & Act
        const result = MassConverter.ouncesToGrams(ounce);

        // Assert
        expect(result).toEqual(gram);
      });
    });
  });
});
