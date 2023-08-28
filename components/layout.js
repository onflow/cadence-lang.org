import Navigation from './navigation'
import Footer from './footer'

export default function Layout({ children }) {
    return (
        <>
            <Navigation />
            {children}
            <Footer />
        </>
    )
}
