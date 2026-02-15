import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { GmoVirtualAccountResponse } from './dto/virtual-account.dto';

/**
 * GMOあおぞらネット銀行 API連携サービス
 *
 * 注意: 実際のGMO API仕様に基づいて調整が必要です
 * 以下は一般的な銀行APIの構造を想定した実装例です
 */
@Injectable()
export class GmoApiService {
  private readonly logger = new Logger(GmoApiService.name);
  private readonly client: AxiosInstance;
  private readonly apiKey: string;
  private readonly apiEndpoint: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GMO_API_KEY') || '';
    this.apiEndpoint = this.configService.get<string>('GMO_API_ENDPOINT') || '';

    if (!this.apiKey || !this.apiEndpoint) {
      this.logger.warn(
        'GMO API credentials not configured. Set GMO_API_KEY and GMO_API_ENDPOINT in .env',
      );
    }

    // Axios インスタンス作成
    this.client = axios.create({
      baseURL: this.apiEndpoint,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    // レスポンスインターセプター（ログ・エラーハンドリング）
    this.client.interceptors.response.use(
      (response) => {
        this.logger.debug(`GMO API Response: ${response.config.url}`, {
          status: response.status,
        });
        return response;
      },
      (error) => {
        this.logger.error('GMO API Error', {
          url: error.config?.url,
          status: error.response?.status,
          data: error.response?.data,
        });
        throw error;
      },
    );
  }

  /**
   * バーチャル口座を作成
   *
   * @param accountName - 口座名義
   * @param purpose - 用途（メタデータとして送信）
   * @returns GMOから返されたバーチャル口座情報
   */
  async createVirtualAccount(
    accountName: string,
    purpose: string,
  ): Promise<GmoVirtualAccountResponse> {
    this.logger.log(`Creating virtual account: ${accountName} (${purpose})`);

    try {
      const response = await this.client.post<GmoVirtualAccountResponse>(
        '/virtual-accounts',
        {
          accountName,
          metadata: {
            purpose,
            createdBy: 'CocoBa',
          },
        },
      );

      this.logger.log(
        `Virtual account created: ${response.data.accountNumber}`,
      );

      return response.data;
    } catch (error) {
      this.logger.error('Failed to create virtual account', (error as any).stack);
      throw new BadRequestException(
        'Failed to create virtual account with GMO',
      );
    }
  }

  /**
   * バーチャル口座情報を取得
   *
   * @param accountNumber - バーチャル口座番号
   */
  async getVirtualAccount(
    accountNumber: string,
  ): Promise<GmoVirtualAccountResponse> {
    this.logger.log(`Fetching virtual account: ${accountNumber}`);

    try {
      const response = await this.client.get<GmoVirtualAccountResponse>(
        `/virtual-accounts/${accountNumber}`,
      );

      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch virtual account', (error as any).stack);
      throw new BadRequestException('Failed to fetch virtual account');
    }
  }

  /**
   * バーチャル口座を無効化
   *
   * @param accountNumber - バーチャル口座番号
   */
  async deactivateVirtualAccount(accountNumber: string): Promise<void> {
    this.logger.log(`Deactivating virtual account: ${accountNumber}`);

    try {
      await this.client.post(`/virtual-accounts/${accountNumber}/deactivate`);

      this.logger.log(`Virtual account deactivated: ${accountNumber}`);
    } catch (error) {
      this.logger.error('Failed to deactivate virtual account', (error as any).stack);
      throw new BadRequestException('Failed to deactivate virtual account');
    }
  }

  /**
   * 取引履歴を取得
   *
   * @param accountNumber - バーチャル口座番号
   * @param fromDate - 開始日
   * @param toDate - 終了日
   */
  async getTransactions(
    accountNumber: string,
    fromDate: Date,
    toDate: Date,
  ): Promise<any[]> {
    this.logger.log(`Fetching transactions for: ${accountNumber}`);

    try {
      const response = await this.client.get(
        `/virtual-accounts/${accountNumber}/transactions`,
        {
          params: {
            from: fromDate.toISOString(),
            to: toDate.toISOString(),
          },
        },
      );

      return response.data.transactions || [];
    } catch (error) {
      this.logger.error('Failed to fetch transactions', (error as any).stack);
      throw new BadRequestException('Failed to fetch transactions');
    }
  }

  /**
   * 残高照会
   *
   * @param accountNumber - バーチャル口座番号
   */
  async getBalance(accountNumber: string): Promise<number> {
    this.logger.log(`Fetching balance for: ${accountNumber}`);

    try {
      const response = await this.client.get(
        `/virtual-accounts/${accountNumber}/balance`,
      );

      return response.data.balance || 0;
    } catch (error) {
      this.logger.error('Failed to fetch balance', (error as any).stack);
      return 0;
    }
  }

  /**
   * Webhook署名を検証
   *
   * @param payload - Webhookペイロード（JSON文字列）
   * @param signature - GMOから送られてきた署名
   * @param secret - Webhook Secret
   */
  verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string,
  ): boolean {
    const crypto = require('crypto');

    try {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      // タイミング攻撃対策の比較
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature),
      );
    } catch (error) {
      this.logger.error('Signature verification failed', error);
      return false;
    }
  }
}
