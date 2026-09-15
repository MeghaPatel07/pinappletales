import { contact } from '@/config/site'
import { Icon } from '@/components/ui/Icon'

export function WhatsappFab() {
  return (
    <a
      href={contact.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="whatsapp-fab fixed z-[60] flex h-12 w-12 items-center overflow-hidden rounded-full bg-[#25D366] text-white shadow-[0_14px_34px_-12px_rgba(37,211,102,0.6)] md:h-14 md:w-14 md:hover:w-[186px] md:focus-visible:w-[186px]"
      style={{ right: 'max(1.25rem, env(safe-area-inset-right))', bottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center md:h-14 md:w-14">
        <Icon name="whatsapp" size={26} className="h-[22px] w-[22px] md:h-[26px] md:w-[26px]" />
      </span>
      <span className="block shrink-0 whitespace-nowrap pr-5 text-[0.95rem] font-medium">Chat with us</span>
    </a>
  )
}
