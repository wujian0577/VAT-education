
export interface ChainStage {
  id: string;
  name: string;
  role: string;
  purchasePrice: number; // Cost from previous stage
  salePrice: number;     // Price to next stage
  vatRate: number;       // Current VAT rate (e.g., 0.13)
}

export interface TaxCalculation {
  inputTax: number;      // 进项税
  outputTax: number;     // 销项税
  payableTax: number;    // 应纳税额
  totalCost: number;     // 含税采购价
  totalSale: number;     // 含税销售价
  valueAdded: number;    // 增值部分 (不含税)
}

export interface StageData extends ChainStage {
  calc: TaxCalculation;
}
