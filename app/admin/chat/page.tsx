import {
  getChats,
  getMensajes,
  getChatsGuardados,
  getMensajesGuardados,
  motivoSinChat,
} from "@/lib/waha";
import { ChatClient } from "./chat-client";

/**
 * CHAT — las conversaciones de WhatsApp del negocio, dentro del panel.
 *
 * Para qué sirve: hasta ahora, para ver qué le decía Nachito a un cliente había
 * que abrir el celular. Acá se lee todo desde la compu, al lado de los pedidos.
 *
 * ⚠️ Es SOLO LECTURA, y a propósito: para responderle a alguien hay que hacerlo
 * desde WhatsApp en el teléfono. Eso no es una limitación, es lo correcto —
 * cuando el dueño escribe a mano desde el celular, el bot se calla solo 3 horas
 * en ESE chat (la "pausa del dueño"); si el panel mandara el mensaje por la API,
 * el bot no se enteraría y le contestaría encima al cliente.
 */

export const dynamic = "force-dynamic";

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  // Fuente principal: NUESTRO historial (quenachos.mensajes), que se llena con
  // cada mensaje que pasa. Si algún día la sesión de WhatsApp sí guarda las
  // charlas, se usa eso en su lugar sin cambiar nada más.
  let chats = await getChatsGuardados();
  let propio = chats.length > 0;
  if (!propio) chats = await getChats();
  const motivo = propio ? "ok" : motivoSinChat();
  // El chat abierto: el pedido por la URL si existe en la lista, o el primero.
  // Se valida contra la lista para que nadie pueda pedir una conversación que
  // no es de este número escribiendo cualquier cosa en la barra de direcciones.
  const activo = chats.find((x) => x.id === c) ?? chats[0] ?? null;
  const mensajes = !activo
    ? []
    : propio
      ? await getMensajesGuardados(activo.telefono)
      : await getMensajes(activo.id);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-display-md uppercase leading-none">Chat</h1>
        <p className="mt-1 text-body-sm text-[var(--color-gris-500)]">
          Las conversaciones de tu WhatsApp, para leerlas sin sacar el celular.
          Para <strong>responder</strong>, contestá desde el teléfono: así el bot
          se calla solo en ese chat y no le escribe encima al cliente.
        </p>
      </header>

      <ChatClient chats={chats} activo={activo} mensajes={mensajes} motivo={motivo} />
    </div>
  );
}
