import { AIError } from '../errors/AIErrors';
import type { AIProviderType } from '../types/AIProviderType';
import type { AIProvider } from './AIProvider';

export type ProviderMap = Readonly<Record<AIProviderType, AIProvider>>;

/**
 * Runtime provider registry with explicit provider switching.
 */
export class AIRegistry {
  private activeProviderType: AIProviderType;

  public constructor(
    private readonly providers: ProviderMap,
    defaultProvider: AIProviderType,
  ) {
    this.activeProviderType = defaultProvider;
  }

  /**
   * Switches the active provider.
   */
  public use(providerType: AIProviderType): AIProvider {
    const provider = this.providers[providerType];

    if (!provider) {
      throw new AIError(
        'PROVIDER_UNAVAILABLE',
        `AI provider "${providerType}" is not registered.`,
        providerType,
      );
    }

    this.activeProviderType = providerType;
    return provider;
  }

  /**
   * Returns the active provider.
   */
  public getActiveProvider(): AIProvider {
    return this.providers[this.activeProviderType];
  }

  /**
   * Returns all registered providers.
   */
  public getProviders(): readonly AIProvider[] {
    return Object.values(this.providers);
  }

  /**
   * Returns the active provider type.
   */
  public getActiveProviderType(): AIProviderType {
    return this.activeProviderType;
  }
}
