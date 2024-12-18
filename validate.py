import json
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.serialization import load_pem_public_key

with open('ticket.txt', 'r') as file:
    ticket = json.load(file)

def validate(ticket: str) -> bool:
    ticket_infos = ticket["ticketInfos"]
    signature = bytes.fromhex(ticket["signature"])
    

    ticket_infos_json = json.dumps(ticket_infos, sort_keys=True, separators=(',', ':')).encode('utf-8')

    digest = hashes.Hash(hashes.SHA256())
    digest.update(ticket_infos_json)
    hashed_ticket_infos = digest.finalize()


    with open("public.pem", "rb") as key_file:
        public_key = load_pem_public_key(
            key_file.read(),
        )

    try:
        public_key.verify(
            signature,
            hashed_ticket_infos,
            padding.PKCS1v15(),
            hashes.SHA256()
        )
        print("Ticket ist gültig!")
        
        owner = dict(ticket_infos)['ownerName']
        validTo = dict(ticket_infos)['validTo']
        
        print('Ticket gehört:', owner)
        print('Ticket gültig bis:', validTo)
        
        return True
    except Exception as e:
        print(f"Ticket ist ungültig: {e}")
        return False

validate(ticket)