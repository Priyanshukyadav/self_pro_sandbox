import { createContext, useContext, useMemo, useState } from 'react'
import { Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'

const doctors = [
  { id: '1', name: 'Dr. Maya Patel', specialty: 'Cardiologist', price: 120 },
  { id: '2', name: 'Dr. James Wilson', specialty: 'Dermatologist', price: 95 },
  { id: '3', name: 'Dr. Sofia Chen', specialty: 'Pediatrician', price: 100 },
]

const BookingContext = createContext(null)

function useBookings() {
  const context = useContext(BookingContext)

  if (!context) {
    throw new Error('Booking pages must be rendered within the booking provider')
  }

  return context
}

function BookingProvider({ children }) {
  const [bookings, setBookings] = useState([])

  function addBooking(doctor) {
    setBookings((currentBookings) => [
      ...currentBookings,
      { id: crypto.randomUUID(), doctor },
    ])
  }

  function removeBooking(bookingId) {
    setBookings((currentBookings) =>
      currentBookings.filter((booking) => booking.id !== bookingId),
    )
  }

  const total = useMemo(
    () => bookings.reduce((sum, booking) => sum + booking.doctor.price, 0),
    [bookings],
  )

  const value = useMemo(
    () => ({ bookings, addBooking, removeBooking, total }),
    [bookings, total],
  )

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  )
}

function DoctorsPage() {
  return (
    <main>
      <h1>Find a doctor</h1>
      <nav>
        <Link to="/checkout">View booking cart</Link>
      </nav>
      <ul>
        {doctors.map((doctor) => (
          <li key={doctor.id}>
            <h2>{doctor.name}</h2>
            <p>{doctor.specialty}</p>
            <p>Consultation: ${doctor.price}</p>
            <Link to={`/doctor/${doctor.id}`}>View doctor</Link>
          </li>
        ))}
      </ul>
    </main>
  )
}

function DoctorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addBooking } = useBookings()
  const doctor = doctors.find((item) => item.id === id)

  if (!doctor) {
    return (
      <main>
        <h1>Doctor not found</h1>
        <Link to="/doctors">Browse doctors</Link>
      </main>
    )
  }

  function handleBooking() {
    addBooking(doctor)
    navigate('/checkout')
  }

  return (
    <main>
      <Link to="/doctors">Back to doctors</Link>
      <h1>{doctor.name}</h1>
      <p>Specialty: {doctor.specialty}</p>
      <p>Consultation: ${doctor.price}</p>
      <button type="button" onClick={handleBooking}>
        Add appointment to cart
      </button>
    </main>
  )
}

function CheckoutPage() {
  const { bookings, removeBooking, total } = useBookings()

  return (
    <main>
      <h1>Your appointments</h1>
      <Link to="/doctors">Browse doctors</Link>
      {bookings.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul>
            {bookings.map((booking) => (
              <li key={booking.id}>
                <h2>{booking.doctor.name}</h2>
                <p>{booking.doctor.specialty}</p>
                <p>${booking.doctor.price}</p>
                <button
                  type="button"
                  onClick={() => removeBooking(booking.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <p>Total: ${total}</p>
          <button type="button" disabled>
            Confirm booking
          </button>
        </>
      )}
    </main>
  )
}

function App() {
  return (
    <BookingProvider>
      <Routes>
        <Route path="/doctors" element={<DoctorsPage />} />
        <Route path="/doctor/:id" element={<DoctorPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="*" element={<Navigate to="/doctors" replace />} />
      </Routes>
    </BookingProvider>
  )
}

export default App
