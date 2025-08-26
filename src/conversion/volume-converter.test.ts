import { describe, expect, test } from "bun:test";
import { VolumeConverter } from "./volume-converter";

describe("VolumeConverter", () => {
  describe("millilitresToFluidOunces", () => {
    [
      [1, 0.03],
      [10, 0.34],
      [20, 0.68],
      [30, 1.01],
    ].forEach(([millilitre, fluidOunce]) => {
      test(`should convert ${millilitre} ml to ${fluidOunce} fl oz`, () => {
        // Arrange & Act
        const result = VolumeConverter.millilitresToFluidOunces(millilitre);

        // Assert
        expect(result).toEqual(fluidOunce);
      });
    });
  });

  describe("fluidOuncesToMillilitres", () => {
    [
      [1, 29.57],
      [10, 295.74],
      [20, 591.47],
      [30, 887.21],
    ].forEach(([fluidOunce, millilitre]) => {
      test(`should convert ${fluidOunce} fl oz to ${millilitre} ml`, () => {
        // Arrange & Act
        const result = VolumeConverter.fluidOuncesToMillilitres(fluidOunce);

        // Assert
        expect(result).toEqual(millilitre);
      });
    });
  });

  describe("litresToGallons", () => {
    [
      [1, 0.26],
      [10, 2.64],
      [20, 5.28],
      [30, 7.93],
    ].forEach(([litre, gallon]) => {
      test(`should convert ${litre} l to ${gallon} gal`, () => {
        // Arrange & Act
        const result = VolumeConverter.litresToGallons(litre);

        // Assert
        expect(result).toEqual(gallon);
      });
    });
  });

  describe("gallonsToLitres", () => {
    [
      [1, 3.79],
      [10, 37.85],
      [20, 75.71],
      [30, 113.56],
    ].forEach(([gallon, litre]) => {
      test(`should convert ${gallon} gal to ${litre} l`, () => {
        // Arrange & Act
        const result = VolumeConverter.gallonsToLitres(gallon);

        // Assert
        expect(result).toEqual(litre);
      });
    });
  });

  describe("millilitresToPints", () => {
    [
      [10, 0.02],
      [20, 0.04],
      [30, 0.05],
      [100, 0.18],
      [10000, 17.6],
    ].forEach(([millilitre, pint]) => {
      test(`should convert ${millilitre} ml to ${pint} pt`, () => {
        // Arrange & Act
        const result = VolumeConverter.millilitresToPints(millilitre);

        // Assert
        expect(result).toEqual(pint);
      });
    });
  });

  describe("pintsToMillilitres", () => {
    [
      [1, 568.18],
      [2.5, 1420.45],
      [10, 5681.82],
      [20, 11363.64],
    ].forEach(([pint, millilitre]) => {
      test(`should convert ${pint} pt to ${millilitre} ml`, () => {
        // Arrange & Act
        const result = VolumeConverter.pintsToMillilitres(pint);

        // Assert
        expect(result).toEqual(millilitre);
      });
    });
  });
});
