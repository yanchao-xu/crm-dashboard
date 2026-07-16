import type { ExchangeRate, CurrencyItem } from "@/types";

/**
 * 汇率转换服务
 * 
 * 汇率表中 rate = fromCurrency / toCurrency
 * 即 1 fromCurrency = rate toCurrency
 * 
 * 转换公式：
 * - 正向 (from → to): amount * rate
 * - 反向 (to → from): amount * (1 / rate)
 * 
 * 币种标识兼容：传入的 currencyCode 可能是真正的 code（如 "CNY"）
 * 也可能是老数据遗留的 id（如 "25887"）。内部通过 currencies 列表做 id → code 映射。
 */
export class ExchangeRateService {
  private rates: ExchangeRate[];
  private currencies: CurrencyItem[];

  constructor(rates: ExchangeRate[], currencies: CurrencyItem[] = []) {
    this.rates = rates;
    this.currencies = currencies;
  }

  /**
   * 将传入的值标准化为 code
   * 如果已经是 code 直接返回，否则当 id 查字典映射成 code
   */
  private normalizeToCode(value: string): string {
    // 先看是否已经是一个已知的 code
    const byCode = this.currencies.find(c => c.code === value);
    if (byCode) return byCode.code;
    // 否则当 id 查（兼容数字/字符串）
    const byId = this.currencies.find(c => String(c.id) === String(value));
    if (byId) return byId.code;
    // 都找不到，原样返回
    return value;
  }

  /**
   * 获取 fromCurrencyCode → toCurrencyCode 的汇率
   * 
   * 查找策略：
   * 1. 同币种 → 返回 1
   * 2. 正向查找 (from → to)
   * 3. 反向查找 (to → from)，取倒数
   * 4. 都找不到 → 返回 1（兜底）
   */
  getRate(fromCurrencyCode: string, toCurrencyCode: string): number {
    const from = this.normalizeToCode(fromCurrencyCode);
    const to = this.normalizeToCode(toCurrencyCode);

    if (from === to) return 1;

    // 正向查找
    const direct = this.rates.find(
      (r) => r.fromCurrencyCode === from && r.toCurrencyCode === to,
    );
    if (direct) return direct.rate;

    // 反向查找，取倒数
    const reverse = this.rates.find(
      (r) => r.fromCurrencyCode === to && r.toCurrencyCode === from,
    );
    if (reverse && reverse.rate !== 0) return 1 / reverse.rate;

    // 兜底
    return 1;
  }

  /**
   * 将金额从源币种转换为目标币种
   */
  convert(amount: number, fromCurrencyCode: string, toCurrencyCode: string): number {
    if (!fromCurrencyCode || !toCurrencyCode) return amount;
    const rate = this.getRate(fromCurrencyCode, toCurrencyCode);
    return amount * rate;
  }
}
