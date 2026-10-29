import unittest
import sys
from pathlib import Path

# Add cli directory to sys.path
sys.path.insert(0, str(Path(__file__).parent))
from validator import FormalDFA, TraceValidator, load_preset

class TestProtocolStateValidatorCLI(unittest.TestCase):
    def setUp(self):
        self.tcp_spec = load_preset("tcp")
        self.dfa = FormalDFA(self.tcp_spec)
        self.validator = TraceValidator(self.dfa)

    def test_valid_handshake(self):
        trace = ["ACTIVE_OPEN", "RCV_SYN_ACK", "SEND_DATA", "RCV_DATA", "CLOSE_APP", "RCV_ACK", "RCV_FIN", "TIMEOUT_2MSL"]
        res = self.validator.verify(trace)
        self.assertTrue(res["is_valid"])
        self.assertTrue(res["is_accepted"])
        self.assertEqual(res["final_state"], "CLOSED")

    def test_invalid_event_detection_and_recovery(self):
        # In SYN_SENT, illegal SEND_DATA
        trace = ["ACTIVE_OPEN", "SEND_DATA"]
        res = self.validator.verify(trace)
        self.assertFalse(res["is_valid"])
        self.assertFalse(res["is_accepted"])
        self.assertIsNotNone(res["failure"])
        self.assertEqual(res["failure"]["from_state"], "SYN_SENT")
        # Recovery to CLOSED from SYN_SENT is CLOSE_APP
        self.assertIn("CLOSE_APP", res["recovery_trace"])

if __name__ == "__main__":
    unittest.main()

