/**
 * RailCare — Railway Complaint Management System
 * Client-Side JavaScript enhancements
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Auto dismiss alerts after 5 seconds
  const alerts = document.querySelectorAll('.alert');
  if (alerts.length > 0) {
    setTimeout(() => {
      alerts.forEach(alert => {
        alert.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        alert.style.opacity = '0';
        alert.style.transform = 'translateY(-10px)';
        setTimeout(() => alert.remove(), 400);
      });
    }, 5000);
  }

  // 2. Character counter for complaint description textarea
  const descArea = document.getElementById('description');
  const charCounter = document.getElementById('char-counter');
  if (descArea && charCounter) {
    const updateCounter = () => {
      const len = descArea.value.length;
      charCounter.textContent = `${len} characters`;
    };
    descArea.addEventListener('input', updateCounter);
    updateCounter();
  }

  // 3. Confirmation for FIFO Queue processing
  const processBtn = document.getElementById('btn-process-fifo');
  if (processBtn) {
    processBtn.addEventListener('click', (e) => {
      if (!confirm('Are you sure you want to dequeue and process the earliest pending complaint (FIFO)?')) {
        e.preventDefault();
      }
    });
  }

  // 4. Password match confirmation on registration
  const regForm = document.getElementById('registration-form');
  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      const pwd = document.getElementById('password')?.value;
      const cpwd = document.getElementById('confirm_password')?.value;
      if (pwd && cpwd && pwd !== cpwd) {
        e.preventDefault();
        alert('Passwords do not match. Please ensure both passwords are identical.');
      }
    });
  }
});
