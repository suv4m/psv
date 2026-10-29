# Protocol State Validator (PSV)
### Formal Automata-Based Protocol Verification, Conformance Testing & Trace Diagnostic Engine

**Author:** Suvam Sabyasachi Parida  
**Registration ID:** 2402040095  
**Course Assignment:** Theory of Computation (TOC)  
**Registered Topic:** `Protocol State Validator`

---

## 1. Theoretical TOC Formulation

Every communication protocol in **PSV** is formally modeled as a 5-tuple Deterministic Finite Automaton (DFA):

$$M = (Q, \Sigma, \delta, q_0, F)$$

Where:
* **$Q$ (Finite State Set):** Discrete protocol lifecycle states (e.g., $\{ \text{CLOSED}, \text{LISTEN}, \text{SYN\_SENT}, \text{ESTABLISHED}, \dots \}$).
* **$\Sigma$ (Alphabet):** The discrete vocabulary of permissible protocol events and packet types.
* **$\delta : Q \times \Sigma \to Q \cup \{\bot\}$ (Transition Function):** Deterministic transition mapping. If an event $e \in \Sigma$ is illegal in state $q$, $\delta(q, e) = \bot$ (trap state / violation vector).
* **$q_0 \in Q$:** Mandatory protocol entry state.
* **$F \subseteq Q$:** Quiescent accepting states where sessions cleanly terminate or safely idle.

### Formal Language of Accepted Protocols:
A trace $T = \langle e_1, e_2, \dots, e_k \rangle \in \Sigma^*$ is accepted if and only if:

$$\hat{\delta}(q_0, T) \in F \quad \text{where} \quad \hat{\delta}(q, \varepsilon) = q, \quad \hat{\delta}(q, w \cdot a) = \delta(\hat{\delta}(q, w), a)$$

### Formal Verification Invariants:
1. **Safety Invariant:** $\forall i \in [1, k], \; \hat{\delta}(q_0, \langle e_1 \dots e_i \rangle) \neq \bot$ (No forbidden transitions occur).
2. **Liveness / Recovery Invariant:** When a violation occurs at state $s_{fail}$, PSV deploys **Dijkstra/BFS graph backtracking** to compute the **Minimum Recovery Trace** $T_{rec}$ such that:
   $$\hat{\delta}(s_{fail}, T_{rec}) \in F$$

---

## 2. Core Capabilities & Architecture

| Feature | Description | Theory of Computation Concept |
| :--- | :--- | :--- |
| **Interactive FSM Canvas** | Real-time SVG state graph with Dagre hierarchical auto-layout, glowing active states, and animated pulse tokens. | Digraph representation of $M = (Q, \Sigma, \delta, q_0, F)$ |
| **Interactive Scrubber** | Step forward/backward, play, pause, and slider playback over trace event execution. | Sequential string membership evaluation |
| **Backtracking Recovery** | Computes the shortest sequence of events to navigate from an illegal state back to a valid final state. | Breadth-First Search (BFS) on automata state graph |
| **Conformance Testing Lab** | Automatically synthesizes test suites measuring State Coverage ($C_{state}$) and Transition Coverage ($C_{trans}$), plus adversarial fuzzing. | Automata covering tours & language boundary testing |
| **Log Stream Ingestion** | Regex-based deterministic tokenizer that converts raw server log dumps into formal event symbols. | Lexical tokenization & formal language parsing |
| **5 Industrial Presets** | Pre-loaded with TCP (RFC 793), OAuth 2.0 PKCE (RFC 7636), TLS 1.3 (RFC 8446), ISO 8583 ATM Banking, and MQTT 5.0 IoT. | Real-world applications of finite automata |
| **LaTeX & Matrix Exporter** | 1-click generation of the formal transition matrix $\delta$ in LaTeX format for reports. | Formal mathematical representations |
| **Dual Engine (Web + CLI)** | High-density dark-mode web studio paired with pure Python 3 CLI for command-line terminal defense. | Multi-platform TOC verification |

---

## 3. Quick Start Guide

### Option A: Launch Interactive Web Studio
```bash
# 1. Start local Vite development server
npm run dev

# 2. Or build production static distribution
npm run build
npm run preview
```

### Option B: Run Standalone Python CLI
```bash
# 1. Run demonstration with TCP protocol (Valid trace)
python cli/validator.py --protocol tcp --demo valid

# 2. Run demonstration with TCP protocol (Injected violation)
python cli/validator.py --protocol tcp --demo invalid

# 3. Verify a custom sequence of events
python cli/validator.py --protocol tcp --trace "ACTIVE_OPEN,RCV_SYN_ACK,SEND_DATA,CLOSE_APP"

# 4. Run automated Python CLI unit tests
python cli/test_cli.py
```

### Option C: Run Formal TypeScript Engine Tests
```bash
npx vitest run
```

---

## 4. Viva Voce Defense FAQ (TOC Examination)

**Q1: How is this different from a simple if-else switch or dictionary lookup?**  
*Answer:* A simple dictionary lookup lacks formal language properties. PSV formally represents protocols as 5-tuples $M=(Q, \Sigma, \delta, q_0, F)$, validates string membership $w \in L(M)$, detects unreachable and sink states, synthesizes covering test suites with formal metric guarantees ($C_{state}, C_{trans}$), and deploys graph search algorithms (BFS) to compute the shortest recovery sequence when a safety invariant is broken.

**Q2: What is the computational complexity of trace validation and backtracking?**  
*Answer:*  
* Trace validation operates in $O(k)$ time, where $k$ is the length of the event sequence (linear scan).  
* Minimum recovery trace computation operates in $O(|V| + |E|)$ via Breadth-First Search over the state transition digraph.

**Q3: Can this system handle non-deterministic protocols (NFA)?**  
*Answer:* Communication protocols require determinism so that sender and receiver agree unambiguously on state. However, by subset construction (Rabin-Scott theorem), any non-deterministic protocol with $n$ states can be converted into an equivalent minimal DFA with at most $2^n$ states before verification in PSV.

---

**Protocol State Validator (PSV)** — Theory of Computation Project Assignment.

