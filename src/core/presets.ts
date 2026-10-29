import { ProtocolDefinition } from './types';

export const PROTOCOL_PRESETS: ProtocolDefinition[] = [
  // 1. TCP Connection Management (RFC 793)
  {
    id: 'tcp-rfc793',
    name: 'TCP State Machine (RFC 793)',
    category: 'Network',
    description: 'Transmission Control Protocol (TCP) standard connection establishment, data flow, and four-way termination lifecycle.',
    version: 'RFC 793 / STD 7',
    states: [
      'CLOSED',
      'LISTEN',
      'SYN_SENT',
      'SYN_RCVD',
      'ESTABLISHED',
      'FIN_WAIT_1',
      'FIN_WAIT_2',
      'CLOSING',
      'TIME_WAIT',
      'CLOSE_WAIT',
      'LAST_ACK'
    ],
    alphabet: [
      'PASSIVE_OPEN',
      'ACTIVE_OPEN',
      'SEND_SYN',
      'RCV_SYN',
      'RCV_SYN_ACK',
      'SEND_SYN_ACK',
      'SEND_ACK',
      'RCV_ACK',
      'SEND_DATA',
      'RCV_DATA',
      'CLOSE_APP',
      'RCV_FIN',
      'SEND_FIN',
      'TIMEOUT_2MSL',
      'SEND_RST'
    ],
    initialState: 'CLOSED',
    finalStates: ['CLOSED'],
    transitions: [
      // Server listen & handshake
      { from: 'CLOSED', event: 'PASSIVE_OPEN', to: 'LISTEN', label: 'Listen' },
      { from: 'LISTEN', event: 'RCV_SYN', to: 'SYN_RCVD', label: 'Receive SYN' },
      { from: 'SYN_RCVD', event: 'SEND_SYN_ACK', to: 'SYN_RCVD', label: 'Send SYN+ACK' },
      { from: 'SYN_RCVD', event: 'RCV_ACK', to: 'ESTABLISHED', label: 'Recv ACK -> Connected' },
      
      // Client active open & handshake
      { from: 'CLOSED', event: 'ACTIVE_OPEN', to: 'SYN_SENT', label: 'Active Open' },
      { from: 'SYN_SENT', event: 'RCV_SYN_ACK', to: 'ESTABLISHED', label: 'Recv SYN+ACK' },
      { from: 'SYN_SENT', event: 'CLOSE_APP', to: 'CLOSED', label: 'Abort' },

      // Established bidirectional traffic
      { from: 'ESTABLISHED', event: 'SEND_DATA', to: 'ESTABLISHED', label: 'Send PDU' },
      { from: 'ESTABLISHED', event: 'RCV_DATA', to: 'ESTABLISHED', label: 'Receive PDU' },

      // Client active close (Initiator)
      { from: 'ESTABLISHED', event: 'CLOSE_APP', to: 'FIN_WAIT_1', label: 'App Close' },
      { from: 'FIN_WAIT_1', event: 'RCV_ACK', to: 'FIN_WAIT_2', label: 'Recv ACK' },
      { from: 'FIN_WAIT_2', event: 'RCV_FIN', to: 'TIME_WAIT', label: 'Recv FIN' },
      { from: 'FIN_WAIT_1', event: 'RCV_FIN', to: 'CLOSING', label: 'Simultaneous Close' },
      { from: 'CLOSING', event: 'RCV_ACK', to: 'TIME_WAIT', label: 'Closing ACK' },
      { from: 'TIME_WAIT', event: 'TIMEOUT_2MSL', to: 'CLOSED', label: '2MSL Timer Expire' },

      // Passive close (Responder)
      { from: 'ESTABLISHED', event: 'RCV_FIN', to: 'CLOSE_WAIT', label: 'Peer Closed' },
      { from: 'CLOSE_WAIT', event: 'CLOSE_APP', to: 'LAST_ACK', label: 'App Close' },
      { from: 'LAST_ACK', event: 'RCV_ACK', to: 'CLOSED', label: 'Final ACK Recv' },

      // Error recovery RST
      { from: 'SYN_RCVD', event: 'SEND_RST', to: 'LISTEN', label: 'RST Reset' },
      { from: 'ESTABLISHED', event: 'SEND_RST', to: 'CLOSED', label: 'Hard Reset' }
    ],
    stateDescriptions: {
      CLOSED: 'Fictional starting point; connection does not exist.',
      LISTEN: 'Waiting for connection request from remote TCP.',
      SYN_SENT: 'Waiting for matching connection request after sending SYN.',
      SYN_RCVD: 'Waiting for confirming connection request acknowledgment.',
      ESTABLISHED: 'Open connection; data transfer phase.',
      FIN_WAIT_1: 'Waiting for connection termination request from remote TCP.',
      FIN_WAIT_2: 'Waiting for connection termination request from remote TCP.',
      CLOSING: 'Waiting for connection termination request acknowledgment from remote TCP.',
      TIME_WAIT: 'Waiting sufficient time (2 MSL) to ensure remote TCP received ACK.',
      CLOSE_WAIT: 'Waiting for connection termination request from local user.',
      LAST_ACK: 'Waiting for acknowledgment of connection termination request.'
    },
    safetyInvariants: [
      'Data cannot be transmitted before entering ESTABLISHED.',
      'Active connection cannot transition directly from CLOSED to ESTABLISHED without 3-way handshake.',
      'A closed connection cannot emit data frames.'
    ]
  },

  // 2. OAuth 2.0 PKCE Protocol (RFC 7636)
  {
    id: 'oauth2-pkce',
    name: 'OAuth 2.0 PKCE Flow (RFC 7636)',
    category: 'Security',
    description: 'Proof Key for Code Exchange (PKCE) flow for public clients to mitigate authorization code interception attacks.',
    version: 'RFC 7636 / OAuth 2.1',
    states: [
      'UNAUTHENTICATED',
      'CHALLENGE_GENERATED',
      'AUTH_CODE_REQUESTED',
      'CONSENT_GRANTED',
      'CODE_ISSUED',
      'TOKEN_EXCHANGE',
      'AUTHORIZED_ACTIVE',
      'TOKEN_REFRESHING',
      'SESSION_REVOKED'
    ],
    alphabet: [
      'GEN_CODE_VERIFIER',
      'REDIRECT_TO_AUTH_SERVER',
      'USER_APPROVES_CONSENT',
      'USER_DENIES_CONSENT',
      'RECEIVE_AUTH_CODE',
      'POST_TOKEN_WITH_VERIFIER',
      'TOKEN_SUCCESS',
      'TOKEN_INVALID_VERIFIER',
      'ACCESS_API_RESOURCE',
      'TRIGGER_REFRESH',
      'REFRESH_SUCCESS',
      'REFRESH_FAILED',
      'REVOKE_TOKEN'
    ],
    initialState: 'UNAUTHENTICATED',
    finalStates: ['SESSION_REVOKED', 'UNAUTHENTICATED'],
    transitions: [
      { from: 'UNAUTHENTICATED', event: 'GEN_CODE_VERIFIER', to: 'CHALLENGE_GENERATED', label: 'SHA256 Challenge' },
      { from: 'CHALLENGE_GENERATED', event: 'REDIRECT_TO_AUTH_SERVER', to: 'AUTH_CODE_REQUESTED', label: 'Redirect browser' },
      { from: 'AUTH_CODE_REQUESTED', event: 'USER_APPROVES_CONSENT', to: 'CONSENT_GRANTED', label: 'User Consent' },
      { from: 'AUTH_CODE_REQUESTED', event: 'USER_DENIES_CONSENT', to: 'UNAUTHENTICATED', label: 'Denied' },
      { from: 'CONSENT_GRANTED', event: 'RECEIVE_AUTH_CODE', to: 'CODE_ISSUED', label: 'Auth code redirect' },
      { from: 'CODE_ISSUED', event: 'POST_TOKEN_WITH_VERIFIER', to: 'TOKEN_EXCHANGE', label: 'Token request' },
      { from: 'TOKEN_EXCHANGE', event: 'TOKEN_SUCCESS', to: 'AUTHORIZED_ACTIVE', label: 'Valid tokens received' },
      { from: 'TOKEN_EXCHANGE', event: 'TOKEN_INVALID_VERIFIER', to: 'UNAUTHENTICATED', label: 'Cryptographic mismatch' },
      { from: 'AUTHORIZED_ACTIVE', event: 'ACCESS_API_RESOURCE', to: 'AUTHORIZED_ACTIVE', label: 'Bearer token call' },
      { from: 'AUTHORIZED_ACTIVE', event: 'TRIGGER_REFRESH', to: 'TOKEN_REFRESHING', label: 'Token near expiry' },
      { from: 'TOKEN_REFRESHING', event: 'REFRESH_SUCCESS', to: 'AUTHORIZED_ACTIVE', label: 'Token renewed' },
      { from: 'TOKEN_REFRESHING', event: 'REFRESH_FAILED', to: 'UNAUTHENTICATED', label: 'Refresh token expired' },
      { from: 'AUTHORIZED_ACTIVE', event: 'REVOKE_TOKEN', to: 'SESSION_REVOKED', label: 'Logout / RFC 7009' },
      { from: 'SESSION_REVOKED', event: 'GEN_CODE_VERIFIER', to: 'CHALLENGE_GENERATED', label: 'New session' }
    ],
    stateDescriptions: {
      UNAUTHENTICATED: 'Client has no valid tokens or active session.',
      CHALLENGE_GENERATED: 'code_verifier and code_challenge computed locally.',
      AUTH_CODE_REQUESTED: 'Browser redirected to OAuth authorization server.',
      CONSENT_GRANTED: 'Resource owner granted scope permissions.',
      CODE_ISSUED: 'One-time authorization code received at redirect URI.',
      TOKEN_EXCHANGE: 'Submitting authorization code + plaintext code_verifier to token endpoint.',
      AUTHORIZED_ACTIVE: 'Bearer access token is valid and verified.',
      TOKEN_REFRESHING: 'Exchanging refresh token for new access token.',
      SESSION_REVOKED: 'Access and refresh tokens revoked.'
    },
    safetyInvariants: [
      'Cannot request access token without prior code_verifier challenge verification.',
      'Protected API cannot be called before reaching AUTHORIZED_ACTIVE.',
      'Revoked session cannot access API resources.'
    ]
  },

  // 3. TLS 1.3 Handshake Protocol (RFC 8446)
  {
    id: 'tls13-handshake',
    name: 'TLS 1.3 1-RTT Handshake (RFC 8446)',
    category: 'Security',
    description: 'Modern Transport Layer Security handshake protocol eliminating round trips and enforcing forward secrecy.',
    version: 'RFC 8446',
    states: [
      'TLS_START',
      'CLIENT_HELLO_SENT',
      'SERVER_HELLO_RCVD',
      'ENCRYPTED_EXTENSIONS_RCVD',
      'CERTIFICATE_VERIFIED',
      'SERVER_FINISHED_RCVD',
      'CONNECTED_DATA',
      'TLS_CLOSED'
    ],
    alphabet: [
      'SEND_CLIENT_HELLO',
      'RCV_SERVER_HELLO',
      'RCV_ENCRYPTED_EXTENSIONS',
      'VERIFY_SERVER_CERT',
      'RCV_SERVER_FINISHED',
      'SEND_CLIENT_FINISHED',
      'APP_DATA_TX',
      'APP_DATA_RX',
      'KEY_UPDATE',
      'SEND_CLOSE_NOTIFY',
      'RCV_CLOSE_NOTIFY',
      'ALERT_HANDSHAKE_FAILURE'
    ],
    initialState: 'TLS_START',
    finalStates: ['TLS_CLOSED'],
    transitions: [
      { from: 'TLS_START', event: 'SEND_CLIENT_HELLO', to: 'CLIENT_HELLO_SENT', label: 'ClientHello + KeyShare' },
      { from: 'CLIENT_HELLO_SENT', event: 'RCV_SERVER_HELLO', to: 'SERVER_HELLO_RCVD', label: 'ServerHello + KeyShare' },
      { from: 'CLIENT_HELLO_SENT', event: 'ALERT_HANDSHAKE_FAILURE', to: 'TLS_CLOSED', label: 'Cipher mismatch' },
      { from: 'SERVER_HELLO_RCVD', event: 'RCV_ENCRYPTED_EXTENSIONS', to: 'ENCRYPTED_EXTENSIONS_RCVD', label: 'EncryptedExtensions' },
      { from: 'ENCRYPTED_EXTENSIONS_RCVD', event: 'VERIFY_SERVER_CERT', to: 'CERTIFICATE_VERIFIED', label: 'Verify Cert + Signature' },
      { from: 'ENCRYPTED_EXTENSIONS_RCVD', event: 'ALERT_HANDSHAKE_FAILURE', to: 'TLS_CLOSED', label: 'Invalid cert' },
      { from: 'CERTIFICATE_VERIFIED', event: 'RCV_SERVER_FINISHED', to: 'SERVER_FINISHED_RCVD', label: 'Server Finished' },
      { from: 'SERVER_FINISHED_RCVD', event: 'SEND_CLIENT_FINISHED', to: 'CONNECTED_DATA', label: 'Client Finished' },
      { from: 'CONNECTED_DATA', event: 'APP_DATA_TX', to: 'CONNECTED_DATA', label: 'Encrypted Application Data TX' },
      { from: 'CONNECTED_DATA', event: 'APP_DATA_RX', to: 'CONNECTED_DATA', label: 'Encrypted Application Data RX' },
      { from: 'CONNECTED_DATA', event: 'KEY_UPDATE', to: 'CONNECTED_DATA', label: 'Traffic Secret Ratchet' },
      { from: 'CONNECTED_DATA', event: 'SEND_CLOSE_NOTIFY', to: 'TLS_CLOSED', label: 'Close notify sent' },
      { from: 'CONNECTED_DATA', event: 'RCV_CLOSE_NOTIFY', to: 'TLS_CLOSED', label: 'Close notify recv' }
    ],
    stateDescriptions: {
      TLS_START: 'Initial state before TLS record layer negotiation.',
      CLIENT_HELLO_SENT: 'Client sent supported cipher suites and Diffie-Hellman key share.',
      SERVER_HELLO_RCVD: 'Server selected cipher and provided server public key share.',
      ENCRYPTED_EXTENSIONS_RCVD: 'Encrypted server parameters verified.',
      CERTIFICATE_VERIFIED: 'Server X.509 certificate and CertificateVerify signature validated.',
      SERVER_FINISHED_RCVD: 'Server finished HMAC verified.',
      CONNECTED_DATA: '1-RTT symmetric encryption active (AES-GCM or ChaCha20-Poly1305).',
      TLS_CLOSED: 'Connection gracefully closed via alert notify.'
    },
    safetyInvariants: [
      'Unencrypted application data can NEVER be transmitted in handshake states.',
      'Server certificate must be verified before accepting Server Finished.'
    ]
  },

  // 4. ISO 8583 / ATM Banking Transaction Flow
  {
    id: 'iso8583-atm',
    name: 'ISO 8583 ATM Financial Transaction',
    category: 'Financial',
    description: 'Financial transaction messaging standard representing ATM card-present cash withdrawal lifecycle.',
    version: 'ISO 8583:2003',
    states: [
      'IDLE',
      'CARD_INSERTED',
      'PIN_ENTERED',
      'ACCOUNT_SELECTED',
      'AMOUNT_ENTERED',
      'SWITCH_PENDING',
      'CASH_DISPENSING',
      'RECEIPT_PRINTING',
      'TRANSACTION_COMPLETE'
    ],
    alphabet: [
      'INSERT_CARD',
      'READ_CHIP_ERROR',
      'SUBMIT_PIN',
      'PIN_INCORRECT',
      'SELECT_SAVINGS',
      'SELECT_CURRENT',
      'ENTER_AMOUNT',
      'EXCEED_DAILY_LIMIT',
      'SEND_0200_REQ',
      'RCV_0210_APPROVED',
      'RCV_0210_DECLINED',
      'DISPENSE_CASH_OK',
      'HARDWARE_JAM',
      'PRINT_RECEIPT',
      'EJECT_CARD'
    ],
    initialState: 'IDLE',
    finalStates: ['IDLE', 'TRANSACTION_COMPLETE'],
    transitions: [
      { from: 'IDLE', event: 'INSERT_CARD', to: 'CARD_INSERTED', label: 'Card Inserted' },
      { from: 'CARD_INSERTED', event: 'READ_CHIP_ERROR', to: 'IDLE', label: 'Eject Damaged Card' },
      { from: 'CARD_INSERTED', event: 'SUBMIT_PIN', to: 'PIN_ENTERED', label: 'PIN entered' },
      { from: 'PIN_ENTERED', event: 'PIN_INCORRECT', to: 'CARD_INSERTED', label: 'Retry PIN' },
      { from: 'PIN_ENTERED', event: 'SELECT_SAVINGS', to: 'ACCOUNT_SELECTED', label: 'Select Savings' },
      { from: 'PIN_ENTERED', event: 'SELECT_CURRENT', to: 'ACCOUNT_SELECTED', label: 'Select Current' },
      { from: 'ACCOUNT_SELECTED', event: 'ENTER_AMOUNT', to: 'AMOUNT_ENTERED', label: 'Amount entered' },
      { from: 'AMOUNT_ENTERED', event: 'EXCEED_DAILY_LIMIT', to: 'ACCOUNT_SELECTED', label: 'Limit warning' },
      { from: 'AMOUNT_ENTERED', event: 'SEND_0200_REQ', to: 'SWITCH_PENDING', label: 'ISO 0200 Network Request' },
      { from: 'SWITCH_PENDING', event: 'RCV_0210_APPROVED', to: 'CASH_DISPENSING', label: 'ISO 0210 Approved' },
      { from: 'SWITCH_PENDING', event: 'RCV_0210_DECLINED', to: 'TRANSACTION_COMPLETE', label: 'Declined by Bank' },
      { from: 'CASH_DISPENSING', event: 'DISPENSE_CASH_OK', to: 'RECEIPT_PRINTING', label: 'Sensor confirms cash' },
      { from: 'CASH_DISPENSING', event: 'HARDWARE_JAM', to: 'TRANSACTION_COMPLETE', label: 'Reversal 0420 triggered' },
      { from: 'RECEIPT_PRINTING', event: 'PRINT_RECEIPT', to: 'TRANSACTION_COMPLETE', label: 'Receipt finished' },
      { from: 'TRANSACTION_COMPLETE', event: 'EJECT_CARD', to: 'IDLE', label: 'Eject card and reset' }
    ],
    stateDescriptions: {
      IDLE: 'ATM awaiting user interaction.',
      CARD_INSERTED: 'Smart card EMV chip energized.',
      PIN_ENTERED: 'Encrypted PIN block generated.',
      ACCOUNT_SELECTED: 'Account type chosen.',
      AMOUNT_ENTERED: 'Withdrawal value entered.',
      SWITCH_PENDING: 'Waiting for Bank Core / Switch authorization message.',
      CASH_DISPENSING: 'Mechanical cash shutter actuated.',
      RECEIPT_PRINTING: 'Thermal receipt printing.',
      TRANSACTION_COMPLETE: 'Terminal finalizing transaction records.'
    },
    safetyInvariants: [
      'Cash can NEVER be dispensed without ISO 0210 approval from core banking.',
      'Card must be ejected before machine returns to IDLE state.'
    ]
  },

  // 5. MQTT 5.0 IoT Sensor Protocol
  {
    id: 'mqtt5-iot',
    name: 'MQTT 5.0 IoT Client Lifecycle',
    category: 'IoT',
    description: 'Lightweight publish/subscribe messaging protocol for resource-constrained IoT telemetry devices.',
    version: 'OASIS Standard / MQTT 5.0',
    states: [
      'DISCONNECTED',
      'CONNECT_PENDING',
      'CONNECTED_IDLE',
      'SUBSCRIBING',
      'PUBLISHING_QOS1',
      'PUBACK_WAIT',
      'PINGING',
      'DISCONNECTING'
    ],
    alphabet: [
      'SEND_CONNECT',
      'RCV_CONNACK',
      'RCV_CONNACK_REJECT',
      'SEND_SUBSCRIBE',
      'RCV_SUBACK',
      'SEND_PUBLISH_QOS1',
      'RCV_PUBACK',
      'SEND_PINGREQ',
      'RCV_PINGRESP',
      'PING_TIMEOUT',
      'SEND_DISCONNECT',
      'BROKER_CLOSED'
    ],
    initialState: 'DISCONNECTED',
    finalStates: ['DISCONNECTED'],
    transitions: [
      { from: 'DISCONNECTED', event: 'SEND_CONNECT', to: 'CONNECT_PENDING', label: 'Connect packet' },
      { from: 'CONNECT_PENDING', event: 'RCV_CONNACK', to: 'CONNECTED_IDLE', label: 'Connection accepted' },
      { from: 'CONNECT_PENDING', event: 'RCV_CONNACK_REJECT', to: 'DISCONNECTED', label: 'Bad credentials' },
      { from: 'CONNECTED_IDLE', event: 'SEND_SUBSCRIBE', to: 'SUBSCRIBING', label: 'Subscribe topic' },
      { from: 'SUBSCRIBING', event: 'RCV_SUBACK', to: 'CONNECTED_IDLE', label: 'Subscription confirmed' },
      { from: 'CONNECTED_IDLE', event: 'SEND_PUBLISH_QOS1', to: 'PUBACK_WAIT', label: 'Telemetry publish' },
      { from: 'PUBACK_WAIT', event: 'RCV_PUBACK', to: 'CONNECTED_IDLE', label: 'Broker ACK' },
      { from: 'CONNECTED_IDLE', event: 'SEND_PINGREQ', to: 'PINGING', label: 'Keep-alive ping' },
      { from: 'PINGING', event: 'RCV_PINGRESP', to: 'CONNECTED_IDLE', label: 'Pong reply' },
      { from: 'PINGING', event: 'PING_TIMEOUT', to: 'DISCONNECTED', label: 'Broker unresponsive' },
      { from: 'CONNECTED_IDLE', event: 'SEND_DISCONNECT', to: 'DISCONNECTING', label: 'Clean disconnect' },
      { from: 'DISCONNECTING', event: 'BROKER_CLOSED', to: 'DISCONNECTED', label: 'Socket closed' },
      { from: 'CONNECTED_IDLE', event: 'BROKER_CLOSED', to: 'DISCONNECTED', label: 'Broker drop' }
    ],
    stateDescriptions: {
      DISCONNECTED: 'TCP socket disconnected; client inactive.',
      CONNECT_PENDING: 'CONNECT packet sent; awaiting CONNACK.',
      CONNECTED_IDLE: 'Connected and authenticated to MQTT broker.',
      SUBSCRIBING: 'SUBSCRIBE sent; awaiting topic filter grant SUBACK.',
      PUBLISHING_QOS1: 'Formatting QoS 1 message with packet identifier.',
      PUBACK_WAIT: 'Message in flight; waiting for broker acknowledgment.',
      PINGING: 'Keep-alive timer triggered; awaiting PINGRESP.',
      DISCONNECTING: 'DISCONNECT frame sent; flushing socket.'
    },
    safetyInvariants: [
      'Cannot publish or subscribe while DISCONNECTED.',
      'Must receive PUBACK before considering QoS 1 payload delivered.'
    ]
  }
];

