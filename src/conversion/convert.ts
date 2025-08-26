import { TemperatureConverter } from "./temperatre-converter";
import { MassConverter } from "./mass-converter";
import { VolumeConverter } from "./volume-converter";
import {
  MASS_UNITS,
  VOLUME_UNITS,
  TEMPERATURE_UNITS,
  UnitShort
} from "./model";

class ConversionError extends Error {
  constructor(fromUnit: UnitShort, toUnit: UnitShort) {
    super(`Cannot convert from ${fromUnit} to ${toUnit}`);
  }
}

const convertMass = (
  value: number,
  fromUnit: UnitShort,
  toUnit: UnitShort,
): number => {
  if (!MASS_UNITS[toUnit as keyof typeof MASS_UNITS]) {
    throw new ConversionError(fromUnit, toUnit);
  }

  if (fromUnit === MASS_UNITS.KILOGRAM.short) {
    return MassConverter.kilogramsToPounds(value);
  }

  return MassConverter.poundsToKilograms(value);
};

const convertTemperature = (
  value: number,
  fromUnit: UnitShort,
  toUnit: UnitShort,
): number => {
  if (!TEMPERATURE_UNITS[toUnit as keyof typeof TEMPERATURE_UNITS]) {
    throw new ConversionError(fromUnit, toUnit);
  }

  if (fromUnit === TEMPERATURE_UNITS.CELSIUS.short) {
    return TemperatureConverter.celsiusToFahrenheit(value);
  } else if (
    fromUnit === TEMPERATURE_UNITS.FAHRENHEIT.short &&
    toUnit === TEMPERATURE_UNITS.CELSIUS.short
  ) {
    return TemperatureConverter.fahrenheitToCelsius(value);
  } else if (fromUnit === TEMPERATURE_UNITS.CELSIUS_FAN_OVEN.short) {
    return TemperatureConverter.celsiusFanOvenToFahrenheit(value);
  }

  return TemperatureConverter.fahrenheitToCelsiusFanOven(value);
};

const convertVolume = (
  value: number,
  fromUnit: UnitShort,
  toUnit: UnitShort,
): number => {
  if (!VOLUME_UNITS[toUnit as keyof typeof VOLUME_UNITS]) {
    throw new ConversionError(fromUnit, toUnit);
  }

  if (fromUnit === VOLUME_UNITS.MILLILITRE.short) {
    return VolumeConverter.millilitresToFluidOunces(value);
  } else if (fromUnit === VOLUME_UNITS.FLUID_OUNCE.short) {
    return VolumeConverter.fluidOuncesToMillilitres(value);
  } else if (fromUnit === VOLUME_UNITS.LITRE.short) {
    return VolumeConverter.litresToGallons(value);
  } else if (fromUnit === VOLUME_UNITS.GALLON.short) {
    return VolumeConverter.gallonsToLitres(value);
  }

  return VolumeConverter.pintsToMillilitres(value);
};

export const convert = (
  value: number,
  fromUnit: UnitShort,
  toUnit: UnitShort,
): number => {
  if (MASS_UNITS[fromUnit as keyof typeof MASS_UNITS]) {
    return convertMass(value, fromUnit, toUnit);
  } else if (TEMPERATURE_UNITS[fromUnit as keyof typeof TEMPERATURE_UNITS]) {
    return convertTemperature(value, fromUnit, toUnit);
  } else if (VOLUME_UNITS[fromUnit as keyof typeof VOLUME_UNITS]) {
    return convertVolume(value, fromUnit, toUnit);
  } else {
    throw new ConversionError(fromUnit, toUnit);
  }
};
