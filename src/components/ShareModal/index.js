import "./styles.css";
import { FaTwitter } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import { FaRedditAlien } from "react-icons/fa";
import { FaDiscord } from "react-icons/fa";
import { IoLogoWhatsapp } from "react-icons/io";
import { FaTelegramPlane } from "react-icons/fa";
import { FaInstagramSquare } from "react-icons/fa";
import { FaFacebookMessenger } from "react-icons/fa";

const ShareModal = ({ isOpen, onClose, shareLink }) => {
    if (!isOpen) return null;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareLink);
        alert("Link copied to clipboard!");
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>
                    &times;
                </button>
                <h3>Share post</h3>
                <div className="share-options">
                    <button onClick={() => window.open(`https://twitter.com/share?url=${shareLink}`, "_blank")}>
                        <FaTwitter style={{color: "#1DA1F2"}}/> Twitter
                    </button>
                    <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareLink}`, "_blank")}>
                        <FaFacebook style={{color: "#3b5998"}}/> Facebook
                    </button>
                    <button onClick={() => window.open(`https://reddit.com/submit?url=${shareLink}`, "_blank")}>
                        <FaRedditAlien style={{color: "#FF5700"}}/> Reddit
                    </button>
                    <button onClick={() => window.open(`https://discord.com/share?url=${shareLink}`, "_blank")}>
                        <FaDiscord style={{color: "#738ADB"}}/> Discord
                    </button>
                    <button onClick={() => window.open(`https://wa.me/?text=${shareLink}`, "_blank")}>
                        <IoLogoWhatsapp style={{color: "#25D366"}}/> WhatsApp
                    </button>
                    <button onClick={() => window.open(`https://wa.me/?text=${shareLink}`, "_blank")}>
                        <FaFacebookMessenger style={{color: "#0099FF"}}/> Messenger
                    </button>
                    <button onClick={() => window.open(`https://telegram.me/share/url?url=${shareLink}`, "_blank")}>
                        <FaTelegramPlane style={{color: "#24A1DE"}}/> Telegram
                    </button>
                    <button onClick={() => window.open(`https://www.instagram.com/`, "_blank")}>
                        <FaInstagramSquare style={{color: "#E4405F"}}/> Instagram
                    </button>
                </div>
                <div className="copy-link">
                    <p>Page Link</p>
                    <div>
                        <input type="text" value={shareLink} readOnly />
                        <button onClick={handleCopyLink}>Copy</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
