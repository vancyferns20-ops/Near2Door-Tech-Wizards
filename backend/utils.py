import os
import smtplib
from email.message import EmailMessage

SMTP_HOST = os.getenv('SMTP_HOST')
SMTP_PORT = int(os.getenv('SMTP_PORT') or 0)
SMTP_USER = os.getenv('SMTP_USER')
SMTP_PASS = os.getenv('SMTP_PASS')
FROM_EMAIL = os.getenv('FROM_EMAIL') or SMTP_USER


def send_email(to_email, subject, body):
    """Send an email using SMTP if configured; otherwise log to stdout."""
    if not to_email:
        print(f"send_email: no recipient provided for subject={subject}")
        return False

    if SMTP_HOST and SMTP_PORT and SMTP_USER and SMTP_PASS:
        try:
            msg = EmailMessage()
            msg['Subject'] = subject
            msg['From'] = FROM_EMAIL
            msg['To'] = to_email
            msg.set_content(body)

            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as smtp:
                smtp.starttls()
                smtp.login(SMTP_USER, SMTP_PASS)
                smtp.send_message(msg)
            print(f"Email sent to {to_email}: {subject}")
            return True
        except Exception as e:
            print(f"send_email error: {e}")
            return False
    else:
        # Fallback: log message so admins/devs can see it in logs
        print("SMTP not configured — email content below")
        print(f"To: {to_email}\nSubject: {subject}\n\n{body}")
        return True
