import qrcode

with open('ticket.txt', 'r') as f:
    ticketString = f.read()
    img = qrcode.make(ticketString)
    img.save('ticket.png')
    
    print('QRCode aus Ticket erstellt.')