import { useState } from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';

export default function RequestInviteButton() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const handleRequest = async () => {
    setStatus('Sending...');
    const res = await fetch('/api/request-invite', {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) setStatus('Invitation sent!');
    else setStatus('Error sending invitation.');
  };

  return (
    <>
      <Button
        variant="outlined"
        color="secondary"
        size="large"
        sx={{ fontWeight: 'bold', px: 4, py: 1.5 }}
        onClick={() => setOpen(true)}
      >
        Request Invitation
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Request an Invitation</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Your Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {status && <Typography sx={{ mt: 2 }}>{status}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleRequest}
            disabled={!email || status === 'Sending...'}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
