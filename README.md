# Introduction

- Export wiznote's note to be some printable content
   - The text content will be the first page
   - The images will be in the following pages
 
Check pdfservice for more options.

1. Find the we chat record like following and export them to csv file
  ```sql
  select * from wiz_document where document_location="/We chat/";
  ``` 
 The document_location can be various.


2. Copy ~/.wiznote/your_account/data/notes to some where.
  ```bash
  #!/bin/bash
  # sample
  cp -r ~/.wiznote/zuo.yc@qq.com/data/notes/* ./server/wechat/notes/
  ```

3. Download the file from the front-end. (Because the jspdf need it, the nodejs wrapper doesnot work. You can improve it) Use following command to run the server at the root of the project
 ```bash
 grunt
 ```

# About insert Chinese

Use [node-canvas](https://github.com/Automattic/node-canvas), which is a Cairo backed Canvas implementation for NodeJS, to make picture from text.

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

2. Use node-canvas, PDF itself can embed fonts, but I need more time.

3. Reduce memory usage, nodeJS it self has GC, but not investigate.

# Problem unsolved
1. NodeJS memory management, it must be a limitation, how to increase it and is it possible to make some cache?

2. Is nodeJS not suitable for download-oriented site? I mean, can it accept connections when downloading?

3. What is canvas

4. Why dont you try ES6? and reduce the use of promise style programming. The return type change will significantly change your thinking style
