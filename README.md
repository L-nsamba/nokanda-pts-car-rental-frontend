# Nokanda PTS Car Rental Frontend
React admin dashboard for the Nokanda PTS Car Rental system built by me during my internship with Hexakomb

The backend repository can be found here: https://github.com/L-nsamba/nokanda-pts-car-rental-backend.git

## Tech Stack
- React + Vite
- Tailwind CSS
- React Router DOM
- Axios
- Chart.js / react-chartjs-2

## Setup
1. Clone the repository
```
   git clone https://github.com/L-nsamba/nokanda-pts-car-rental-frontend.git
   cd nokanda-pts-frontend
```
2. Install dependencies
```
   npm install
```
3. Create a `.env` file in the root directory
```
    VITE_API_URL=http://127.0.0.1:8000
```
4. Start the development server
```
   npm run dev
```
    App runs on `http://localhost:5173`

## Pages
- **Login** — admin authentication
- **Dashboard** — stats overview and data visualizations
- **Bookings** — manage bookings and assign drivers
- **Drivers** — manage driver profiles and availability
- **Vehicles** — manage fleet and availability
- **Pricing** — view and edit destination pricing
- **Notifications** — booking activity feed with auto refresh

## Project Structure
```
nokanda-pts-car-rental-frontend/
  └── nokanda-pts-frontend/
           └── src/            
                ├── pages/            # One file per page
                ├── componenets/      # Reusable components (Sidebar, StatCard)
                ├── services/         # Axios API calls
                └── utils/            # Helper functions 
```

## Note
- Requires the backend to be running locally or deployed
- Admin credentials needed to access the dashboard
- Update `VITE_API_URL` in `.env` to point to deployed backend when applicable
  
## Acknowledgements
Special thanks to Mr. Bapu and the team at Hexakomb for the 
guidance, support and opportunity to build this project during my Yr 2 Trimester 2 Internship 2026. 
