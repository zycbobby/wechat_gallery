# Introduction

 - Make 4 photo in one pdf page then make it printable for post card
 - __OR__ make one day's photo in one pdf and make it printable
 - Using wiznote's function
 
Check pdfservice for more options.

1. Find the we chat record like following and export them to csv file
  ```sql
  select * from wiz_document where document_location="/We chat/";
  ``` 


2. Copy ~/.wiznote/your_account/data/notes to some where.
  ```bash
  #!/bin/bash
  # sample
  cp -r ~/.wiznote/zuo.yc@qq.com/data/notes/* ./server/wechat/notes/
  ```

3. Extract them with file descriptor as the folder name, without brace. This function was included in the nodejs script.

4. Download the file from the front-end. (Because the jspdf need it, the nodejs wrapper doesnot work. You can improve it)

# About insert Chinese

Use node-canvas to make picture from text. It is html5 canvas function.

# Experience

I think nodejs is obviously not suitable for some download work. It really make the page slow and cannot accept new connections.

You cannot insert utf-8 character using jsPDF, though obviously it is much better than pdfmake.

Using custom font like [Using Custom Font](https://github.com/bpampuch/pdfmake/wiki/Custom-Fonts---client-side).

You need to get some ttf file from windows/fonts folder. Trust me, it is the fastest way to get ttf folder rather than download them from some where on the internet. It was completely a fault to search anything contains Chinese from the internet.

Then encode them into base64:

```bash
base64 -w 0 xxx.ttf > somefile.out
```
Then copy the file content into my_fonts.js under assets/fonts/

# Problem I solved
1. Using javascript to manipulate image is ... a bad solution... it is CPU sensitive

# How to make pdf from raw text

I recommend use LibreOffice Writer's function. It is convenient.
