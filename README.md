# Back-end for Birds of Aotearoa 
<img width="1726" alt="Screenshot 2023-11-27 at 3 45 51 PM" src="https://github.com/Janadhi14/BirdsOfAotearoaBackend/assets/100277240/e024c06e-f2d7-45d4-a5ab-9bff3a6410e6">
<img width="1063" alt="Screenshot 2023-11-27 at 3 46 23 PM" src="https://github.com/Janadhi14/BirdsOfAotearoaBackend/assets/100277240/cc6051cd-cd33-4009-9c1b-cf1c9e981ce2">
<img width="1728" alt="Screenshot 2023-11-27 at 3 46 35 PM" src="https://github.com/Janadhi14/BirdsOfAotearoaBackend/assets/100277240/0b55b3a7-e3bc-4692-a714-37df8de38272">


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
