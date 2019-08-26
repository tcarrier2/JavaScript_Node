import numpy as np
import cv2
from Crypto.Cipher import DES

frame = cv2.imread("blank.png", cv2.IMREAD_COLOR);

des = DES.new('12345678', DES.MODE_ECB)

text = 'this is the secret message that will be hidden in the picture'

spaces_to_add = 8 - len(text) % 8
for i in range(0, spaces_to_add):
	text = text + " "
	
cipher_text = des.encrypt(text)

cipher_invisible = np.empty(3*len(cipher_text), dtype=int)

for i in range(0, len(cipher_text)):
	ascii = cipher_text[i]

	cipher_invisible[3*i] = ascii / 100
	cipher_invisible[3*i+1] = (ascii%100) / 10
	cipher_invisible[3*i+2] = ascii%10

count = 0
size = frame.shape
for i in range(0, size[0]):
	for j in range(0, size[1]):
		if count > len(cipher_invisible):
			break
		elif count == len(cipher_invisible):
			frame[i,j,2] = 21
			count = count + 1
			break
		else:
			frame[i,j,2] = cipher_invisible[count]
			count = count + 1

cv2.imwrite('hidden.png', frame)
