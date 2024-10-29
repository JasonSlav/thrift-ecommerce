import { Link } from '@remix-run/react';
import { Form } from "@remix-run/react";
import { useEffect, useState } from 'react';

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Logika untuk memeriksa sesi pengguna
    const checkSession = async () => {
      // Misalnya, panggil API untuk memeriksa sesi
      const response = await fetch('/api/session');
      const data = await response.json();
      setIsLoggedIn(data.isLoggedIn);
    };

    checkSession();
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <h1 style={{ color: 'lightblue', fontSize: '24px', fontWeight: 'bold' }}>Welcome to ThriftEase</h1>
      <nav>
        <ul>
          <li>
            <Link to="/user">Lihat Daftar User</Link> {/* Link ke /user/index.tsx */}
          </li>
          <li>
            {isLoggedIn ? (
              <Form action="/logout" method="post">
                <button type="submit">Logout</button>
              </Form>
            ) : (
              <Link to="/login">Login</Link>
            )}
          </li>
        </ul>
      </nav>
    </div>
  );
}
