import AaveV2 from "./protocols/aave-v2";
import Compound from "./protocols/compound";
import Liquity from "./protocols/liquity";
import Ubiquity from "./protocols/ubiquity";

export const protocolStrategies = {
  aaveV2: AaveV2,
  compound: Compound,
  liquity: Liquity,
  ubiquity: Ubiquity
};

export * from "./helpers";
