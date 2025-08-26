import { TemperatureConverter } from "./temperature-converter";
import { MassConverter } from "./mass-converter";
import { VolumeConverter } from "./volume-converter";
import {
  MASS_UNITS,
  VOLUME_UNITS,
  TEMPERATURE_UNITS,
  UnitShort,
  isMassUnit,
  isTemperatureUnit,
  isVolumeUnit
} from "./model";
import Decimal from "decimal.js";

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
  if (!isMassUnit(fromUnit) || !isMassUnit(toUnit)) {
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
  if (!isTemperatureUnit(fromUnit) || !isTemperatureUnit(toUnit)) {
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
  if (!isVolumeUnit(fromUnit) || !isVolumeUnit(toUnit)) {
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
  let result

  if (isMassUnit(fromUnit) && isMassUnit(toUnit)) {
    result = convertMass(value, fromUnit, toUnit);
  } else if (isTemperatureUnit(fromUnit) && isTemperatureUnit(toUnit)) {
    result = convertTemperature(value, fromUnit, toUnit);
  } else if (isVolumeUnit(fromUnit) && isVolumeUnit(toUnit)) {
    result = convertVolume(value, fromUnit, toUnit);
  } else {
    throw new ConversionError(fromUnit, toUnit);
  }

  const rounded = new Decimal(result).toDecimalPlaces(2);
  
  return rounded.isInteger() ? rounded.toNumber() : Number(rounded);
};
