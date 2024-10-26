import { useNavigate } from 'react-router-dom';

export function Patients() {
  const navigate = useNavigate();
  // ... other code

  const handlePatientClick = (patientId: string) => {
    navigate(`/patients/${patientId}`);
  };

  // ... rest of the component
}
