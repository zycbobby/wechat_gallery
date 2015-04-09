# Introduction

 - Make 4 photo in one pdf page then make it printable for post card
 - Using wiznote's function
 
1. Copy ~/.wiznote/your_account/data/notes to some where.
2. Extract them with file descriptor as the folder name, without brace. This function was included in the nodejs script.

3. Download the file from the front-end. (Because the jspdf need it, the nodejs wrapper doesnot work. You can improve it)

# About insert Chinese
You cannot insert utf-8 character using jsPDF, though obviously it is much better than pdfmake.

Using custom font like [Using Custom Font](https://github.com/bpampuch/pdfmake/wiki/Custom-Fonts---client-side).

But it seems quite hard to make it work...

# Experience

I think nodejs is obviously not suitable for some download work. It really make the page slow and cannot accept new connections.
