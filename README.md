# Back-end for Birds of Aotearoa 
## Student ID: 6170302
## Name: Janadhi Dissanayake
## Link to Gitrepo:
https://altitude.otago.ac.nz/disja508/birds-nz-a-2

## Running npm 
the file can be run into asgn2-starter-main code and then running "npm run start"
- the other files are just remaining from 
## Refernces:
Chat gpt assisted in generating code for creating a counter based logic in the case that there were uploaded files had the same file name 
"if (newPhotoName) {
      let counter = 0;
      let photoPath = path.join(__dirname, 'public/images', newPhotoName);

      //checking if there is a file conflict 
      while (await fsPromises.access(photoPath).then(() => true).catch(() => false)) {
        counter++;
        const extension = path.extname(newPhotoName);
        const name = path.basename(newPhotoName, extension);
        newPhotoName = `${name}_${counter}${extension}`;
        photoPath = path.join(__dirname, 'public/images', newPhotoName);
      }
      await fsPromises.writeFile(photoPath, file.buffer);
    }"