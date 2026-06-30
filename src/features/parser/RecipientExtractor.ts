import { PARSER_ATTRIBUTES, PARSER_SELECTORS } from './DomSelectors';
import type { ParsedAddress } from './ParserTypes';

export interface ExtractedRecipients {
  readonly bcc: readonly ParsedAddress[];
  readonly cc: readonly ParsedAddress[];
  readonly recipients: readonly ParsedAddress[];
  readonly sender: ParsedAddress | null;
}

/**
 * Extracts and de-duplicates sender and recipient identities.
 */
export class RecipientExtractor {
  /**
   * Extracts sender, To, CC, and BCC values from one Gmail message node.
   */
  extract(message: Element): ExtractedRecipients {
    const senderElement = message.querySelector(PARSER_SELECTORS.sender);
    const sender = senderElement ? this.extractAddress(senderElement) : null;

    return {
      bcc: this.extractFromContainer(message, PARSER_SELECTORS.bccContainer),
      cc: this.extractFromContainer(message, PARSER_SELECTORS.ccContainer),
      recipients: this.extractPrimaryRecipients(message, sender),
      sender,
    };
  }

  /**
   * Extracts recipients from a semantically identified recipient container.
   */
  private extractFromContainer(
    message: Element,
    selector: string,
  ): readonly ParsedAddress[] {
    const addresses = Array.from(message.querySelectorAll(selector))
      .flatMap((container) =>
        Array.from(container.querySelectorAll(PARSER_SELECTORS.recipient)),
      )
      .map((element) => this.extractAddress(element))
      .filter((address): address is ParsedAddress => address !== null);

    return this.uniqueAddresses(addresses);
  }

  /**
   * Extracts To recipients while excluding sender, CC, and BCC identities.
   */
  private extractPrimaryRecipients(
    message: Element,
    sender: ParsedAddress | null,
  ): readonly ParsedAddress[] {
    const ccEmails = new Set(
      this.extractFromContainer(message, PARSER_SELECTORS.ccContainer).map(
        (address) => address.email,
      ),
    );
    const bccEmails = new Set(
      this.extractFromContainer(message, PARSER_SELECTORS.bccContainer).map(
        (address) => address.email,
      ),
    );

    const recipientContainers = Array.from(
      message.querySelectorAll(PARSER_SELECTORS.recipientDetails),
    );
    const recipientElements =
      recipientContainers.length > 0
        ? recipientContainers.flatMap((container) => {
            const nested = Array.from(
              container.querySelectorAll(PARSER_SELECTORS.recipient),
            );
            return nested.length > 0 ? nested : [container];
          })
        : Array.from(message.querySelectorAll(PARSER_SELECTORS.recipient));

    const addresses = recipientElements
      .map((element) => this.extractAddress(element))
      .filter((address): address is ParsedAddress => address !== null)
      .filter(
        (address) =>
          address.email !== sender?.email &&
          !ccEmails.has(address.email) &&
          !bccEmails.has(address.email),
      );

    return this.uniqueAddresses(addresses);
  }

  /**
   * Converts a Gmail identity element into a normalized address.
   */
  private extractAddress(element: Element): ParsedAddress | null {
    const attributeEmail = PARSER_ATTRIBUTES.email
      .map((attribute) => element.getAttribute(attribute))
      .find((value): value is string => Boolean(value?.includes('@')));
    const email =
      attributeEmail ??
      this.extractEmailFromText(
        `${element.getAttribute('aria-label') ?? ''} ${element.textContent ?? ''}`,
      );

    if (!email) {
      return null;
    }

    const attributeName = PARSER_ATTRIBUTES.name
      .map((attribute) => element.getAttribute(attribute))
      .find((value): value is string => Boolean(value?.trim()));
    const visibleName = element.textContent?.trim() ?? '';
    const normalizedName =
      attributeName?.trim() ??
      visibleName
        .replace(email, '')
        .replace(/[<>()"]/g, '')
        .trim();

    return {
      email: email.toLowerCase(),
      name: normalizedName.length > 0 ? normalizedName : null,
    };
  }

  /**
   * Extracts the first syntactically valid email address from text.
   */
  private extractEmailFromText(value: string): string | null {
    const match = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.exec(value);
    return match?.[0] ?? null;
  }

  /**
   * De-duplicates addresses by normalized email while preserving order.
   */
  private uniqueAddresses(
    addresses: readonly ParsedAddress[],
  ): readonly ParsedAddress[] {
    const seen = new Set<string>();
    return addresses.filter((address) => {
      if (seen.has(address.email)) {
        return false;
      }

      seen.add(address.email);
      return true;
    });
  }
}
