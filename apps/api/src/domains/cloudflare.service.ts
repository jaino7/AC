import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface CloudflareCustomHostname {
  id: string;
  hostname: string;
  ssl: {
    status: string;
    method: string;
    type: string;
    validation_records?: Array<{
      txt_name: string;
      txt_value: string;
    }>;
  };
  status: string;
  verification_errors?: string[];
}

interface CloudflareResponse {
  success: boolean;
  result?: CloudflareCustomHostname;
  errors?: Array<{ code: number; message: string }>;
}

@Injectable()
export class CloudflareService {
  private readonly logger = new Logger(CloudflareService.name);
  private readonly apiToken: string;
  private readonly zoneId: string;
  private readonly baseUrl = 'https://api.cloudflare.com/client/v4';

  constructor(private configService: ConfigService) {
    this.apiToken = this.configService.get<string>('CLOUDFLARE_API_TOKEN') || '';
    this.zoneId = this.configService.get<string>('CLOUDFLARE_ZONE_ID') || '';

    if (!this.apiToken || !this.zoneId) {
      this.logger.warn(
        'Cloudflare credentials not configured. Domain functionality will be disabled.',
      );
    }
  }

  /**
   * Create a custom hostname in Cloudflare
   */
  async createCustomHostname(
    hostname: string,
  ): Promise<CloudflareCustomHostname> {
    if (!this.apiToken || !this.zoneId) {
      throw new Error('Cloudflare credentials not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/zones/${this.zoneId}/custom_hostnames`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            hostname,
            ssl: {
              method: 'txt',
              type: 'dv',
              settings: {
                min_tls_version: '1.2',
              },
            },
          }),
        },
      );

      const data: CloudflareResponse = await response.json();

      if (!data.success || !data.result) {
        const errorMsg =
          data.errors?.map((e) => e.message).join(', ') ||
          'Unknown Cloudflare error';
        throw new Error(`Cloudflare API error: ${errorMsg}`);
      }

      this.logger.log(
        `Custom hostname created: ${hostname} (ID: ${data.result.id})`,
      );
      return data.result;
    } catch (error) {
      this.logger.error(`Failed to create custom hostname: ${(error as any).message}`);
      throw error;
    }
  }

  /**
   * Get custom hostname status from Cloudflare
   */
  async getCustomHostname(
    hostnameId: string,
  ): Promise<CloudflareCustomHostname> {
    if (!this.apiToken || !this.zoneId) {
      throw new Error('Cloudflare credentials not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/zones/${this.zoneId}/custom_hostnames/${hostnameId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const data: CloudflareResponse = await response.json();

      if (!data.success || !data.result) {
        const errorMsg =
          data.errors?.map((e) => e.message).join(', ') ||
          'Unknown Cloudflare error';
        throw new Error(`Cloudflare API error: ${errorMsg}`);
      }

      return data.result;
    } catch (error) {
      this.logger.error(`Failed to get custom hostname: ${(error as any).message}`);
      throw error;
    }
  }

  /**
   * Delete custom hostname from Cloudflare
   */
  async deleteCustomHostname(hostnameId: string): Promise<void> {
    if (!this.apiToken || !this.zoneId) {
      throw new Error('Cloudflare credentials not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/zones/${this.zoneId}/custom_hostnames/${hostnameId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const data: CloudflareResponse = await response.json();

      if (!data.success) {
        const errorMsg =
          data.errors?.map((e) => e.message).join(', ') ||
          'Unknown Cloudflare error';
        throw new Error(`Cloudflare API error: ${errorMsg}`);
      }

      this.logger.log(`Custom hostname deleted: ${hostnameId}`);
    } catch (error) {
      this.logger.error(`Failed to delete custom hostname: ${(error as any).message}`);
      throw error;
    }
  }

  /**
   * Check if Cloudflare is configured
   */
  isConfigured(): boolean {
    return !!(this.apiToken && this.zoneId);
  }
}
