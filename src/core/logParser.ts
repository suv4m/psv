import { EventSymbol, ParsedLogEntry, ProtocolDefinition } from './types';

export class LogStreamParser {
  private protocol: ProtocolDefinition;

  constructor(protocol: ProtocolDefinition) {
    this.protocol = protocol;
  }

  /**
   * Parses raw unstructured log text into matched protocol event tokens.
   */
  public parseLogText(rawText: string): {
    entries: ParsedLogEntry[];
    extractedTrace: EventSymbol[];
    unmatchedCount: number;
  } {
    const lines = rawText.split(/\r?\n/).filter(line => line.trim().length > 0);
    const entries: ParsedLogEntry[] = [];
    const extractedTrace: EventSymbol[] = [];
    let unmatchedCount = 0;

    // Build regex dictionary for alphabet matching
    const alphabetPatterns = this.protocol.alphabet.map(symbol => {
      // Create case-insensitive boundary matcher
      const escaped = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return {
        symbol,
        regex: new RegExp(`\\b${escaped}\\b`, 'i'),
      };
    });

    for (const line of lines) {
      let matchedSymbol: EventSymbol | null = null;

      // Extract timestamp if present [YYYY-MM-DD ... or HH:MM:SS]
      const tsMatch = line.match(/^\[([^\]]+)\]/) || line.match(/^(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?)/);
      const timestamp = tsMatch ? tsMatch[1] : undefined;

      // Check alphabet match
      for (const { symbol, regex } of alphabetPatterns) {
        if (regex.test(line)) {
          matchedSymbol = symbol;
          break;
        }
      }

      if (matchedSymbol) {
        extractedTrace.push(matchedSymbol);
        entries.push({
          rawLine: line,
          timestamp,
          extractedEvent: matchedSymbol,
          isMatched: true,
        });
      } else {
        unmatchedCount++;
        entries.push({
          rawLine: line,
          timestamp,
          extractedEvent: null,
          isMatched: false,
        });
      }
    }

    return {
      entries,
      extractedTrace,
      unmatchedCount,
    };
  }

  /**
   * Generates a sample log stream representing a valid or invalid sequence for demonstration
   */
  public generateSampleLogStream(valid: boolean): string {
    const now = new Date();
    const formatTime = (offsetSec: number) => {
      const d = new Date(now.getTime() + offsetSec * 1000);
      return d.toISOString().replace('T', ' ').substring(0, 19);
    };

    if (this.protocol.id === 'tcp-rfc793') {
      if (valid) {
        return `[${formatTime(0)}] [INFO] [Kernel TCP] Socket created in CLOSED state
[${formatTime(1)}] [INFO] [Kernel TCP] Application initiated ACTIVE_OPEN towards 192.168.1.100:443
[${formatTime(2)}] [INFO] [Kernel TCP] Received matching RCV_SYN_ACK packet with seq=3021 ack=1001
[${formatTime(4)}] [INFO] [Kernel TCP] Established socket transmitting user payload: SEND_DATA len=1420
[${formatTime(6)}] [INFO] [Kernel TCP] Incoming stream frame received: RCV_DATA len=512
[${formatTime(8)}] [INFO] [Kernel TCP] User process triggered CLOSE_APP initiating termination
[${formatTime(9)}] [INFO] [Kernel TCP] Remote peer sent acknowledgment: RCV_ACK
[${formatTime(10)}] [INFO] [Kernel TCP] Received peer FIN segment: RCV_FIN
[${formatTime(11)}] [INFO] [Kernel TCP] Timer elapsed TIMEOUT_2MSL socket cleanly re-enters CLOSED`;
      } else {
        return `[${formatTime(0)}] [INFO] [Kernel TCP] Socket initialized in CLOSED
[${formatTime(1)}] [INFO] [Kernel TCP] Application initiated ACTIVE_OPEN
[${formatTime(2)}] [WARN] [Kernel TCP] Out-of-order segment received: RCV_DATA payload=malicious
[${formatTime(3)}] [ALERT] [Kernel TCP] Protocol violation detected! Data packet in SYN_SENT state`;
      }
    }

    if (this.protocol.id === 'oauth2-pkce') {
      if (valid) {
        return `[${formatTime(0)}] [AUTH] Initializing login workflow: GEN_CODE_VERIFIER
[${formatTime(1)}] [AUTH] Browser navigation event: REDIRECT_TO_AUTH_SERVER
[${formatTime(2)}] [AUTH] OAuth IDP callback: USER_APPROVES_CONSENT
[${formatTime(3)}] [AUTH] Redirect received with auth_code: RECEIVE_AUTH_CODE
[${formatTime(4)}] [AUTH] Exchanging auth_code with code_verifier: POST_TOKEN_WITH_VERIFIER
[${formatTime(5)}] [AUTH] Token response status 200 OK: TOKEN_SUCCESS
[${formatTime(6)}] [AUTH] Client authenticated calling resource: ACCESS_API_RESOURCE
[${formatTime(7)}] [AUTH] User logged out revoking session: REVOKE_TOKEN`;
      } else {
        return `[${formatTime(0)}] [AUTH] Client initialized in UNAUTHENTICATED state
[${formatTime(1)}] [ERROR] [AUTH] Client bypassed consent and called POST_TOKEN_WITH_VERIFIER without auth code!
[${formatTime(2)}] [ALERT] [AUTH] Request rejected with 401 Unauthorized`;
      }
    }

    // Default generic generator
    return this.protocol.alphabet.slice(0, 4).map((evt, idx) => `[${formatTime(idx)}] [SYSTEM] Event processed: ${evt}`).join('\n');
  }
}

