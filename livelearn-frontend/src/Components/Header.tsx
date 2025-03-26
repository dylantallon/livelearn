import "./Header.css";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const Header = () => {
  const openInNewTab = () => {
    const token = localStorage.getItem("token");
    window.open(`https://livelearn-fe28b.web.app?token=${token}`, '_blank')?.focus();
  };

  return (
    <header className="title">
      <h1>LiveLearn</h1>
      {window !== window.top ? 
        <OpenInNewIcon
          className="btn-popout"
          onClick={openInNewTab}
          titleAccess="Open in new tab"
        />
        : null}
    </header>
  )
}

export default Header
