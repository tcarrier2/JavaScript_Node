import numpy as np
import cv2
from Crypto.Cipher import DES

frame = cv2.imread("hidden.png", cv2.IMREAD_COLOR);

des = DES.new('12345678', DES.MODE_ECB)

cipher_invisible = []
flag = 1	
size = frame.shape
for i in range(0, size[0]):
	for j in range(0, size[1]):
		if flag==0:
			break
		elif frame[i,j,2] == 21:
			flag = 0
			break
		else:
			cipher_invisible.append(frame[i,j,2])

cipher_text = []
for i in range(0, len(cipher_invisible), 3):
	x1 = cipher_invisible[i]
	x2 = cipher_invisible[i+1]
	x3 = cipher_invisible[i+2]

	cipher_text.append(x1*100 + x2*10 + x3)

text_bytes = des.decrypt(bytes(cipher_text))

text = text_bytes.decode("utf-8")

print(text)