import type { ExchangeRate } from "@/types";

/**
 * 汇率转换服务
 * 
 * 汇率表中 rate = fromCurrency / toCurrency
 * 即 1 fromCurrency = rate toCurrency
 * 
 * 转换公式：
 * - 正向 (from → to): amount * rate
 * - 反向 (to → from): amount * (1 / rate)
 */
export class ExchangeRateService {
  private rates: ExchangeRate[];

  constructor(rates: ExchangeRate[]) {
    this.rates = rates;
  }

  /**
   * 获取 fromCurrencyId → toCurrencyId 的汇率
   * 
   * 查找策略：
   * 1. 同币种 → 返回 1
   * 2. 正向查找 (from → to)
   * 3. 反向查找 (to → from)，取倒数
   * 4. 都找不到 → 返回 1（兜底）
   */
  getRate(fromCurrencyId: string, toCurrencyId: string): number {
    if (fromCurrencyId === toCurrencyId) return 1;

    // 正向查找
    const direct = this.rates.find(
      (r) => r.fromCurrencyId === fromCurrencyId && r.toCurrencyId === toCurrencyId,
    );
    if (direct) return direct.rate;

    // 反向查找，取倒数
    const reverse = this.rates.find(
      (r) => r.fromCurrencyId === toCurrencyId && r.toCurrencyId === fromCurrencyId,
    );
    if (reverse && reverse.rate !== 0) return 1 / reverse.rate;

    // 兜底
    return 1;
  }

  /**
   * 将金额从源币种转换为目标币种
   */
  convert(amount: number, fromCurrencyId: string, toCurrencyId: string): number {
    if (!fromCurrencyId || !toCurrencyId) return amount;
    const rate = this.getRate(fromCurrencyId, toCurrencyId);
    return amount * rate;
  }
}
