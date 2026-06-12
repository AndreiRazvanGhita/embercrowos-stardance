

def exchange_money(amount, from_currency, to_currency):
    if from_currency == 'USD' and to_currency == 'EUR':
        return amount * 0.85
    elif from_currency == 'EUR' and to_currency == 'USD':
        return amount * 1.18
    else:
        return print("Schimbul valutar nu este ok pentru actiunea solicitata")