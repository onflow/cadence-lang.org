import { FaGithub, FaDiscord } from 'react-icons/fa';

export default function Navigation() {
    return <nav>
        <div className="content-wrapper">
        <span className="logo">Cadence</span>
        <a href="https://developers.flow.com/cadence/">Learn</a>
        <a href="https://play.flow.com/">Playground</a>
        <a href="https://developers.flow.com/cadence/language">Documentation</a>
        <a href="https://flow.com/flow-responsible-disclosure">Security</a>
        <a href="https://github.com/onflow/cadence" title="GitHub"><FaGithub/></a>
        <a href="https://discord.com/invite/J6fFnh2xx6" title="Discord"><FaDiscord/></a>
        </div>
    </nav>;
}
