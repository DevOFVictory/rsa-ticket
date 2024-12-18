import json
import hashlib
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.serialization import load_pem_private_key

with open("private.key", "rb") as key_file:
    private_key = load_pem_private_key(key_file.read(), password=None)

ticketInfos = {
    "ticketInfos": {
        "bookingNumber": 9999,
        "ownerName": input('Namen eingeben: '),
        "validFrom": "2024-12-01T00:00:00+00:00",
        "validTo": "2025-01-01T00:00:00+00:00"
    }
}

json_str = json.dumps(ticketInfos["ticketInfos"], sort_keys=True, separators=(',', ':'))
hash_obj = hashlib.sha256(json_str.encode('utf-8'))
hash_hex = hash_obj.hexdigest()

hash_bytes = bytes.fromhex(hash_hex)

signature = private_key.sign(
    hash_bytes,
    padding.PKCS1v15(),
    hashes.SHA256()
).hex()

ticketInfos["signature"] = signature

ticketString = json.dumps(ticketInfos, separators=(',', ':'))


with open('ticket.txt', 'w') as f:
    f.write(ticketString)

print('Ticket erstellt und signiert.')