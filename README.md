# hanlib

This is a project to make a library of free interactive texts for learners of classical/literary Chinese.

# current focus

The current focus is to transcribe + format the content of the 1927 textbook _Introduction to Literary Chinese_ by J. Brandt. This book is in the public domain in the US. You can access a digitized copy from a US IP address here: https://babel.hathitrust.org/cgi/pt?id=ucbk.ark:/28722/h23r0qb76

## texts &nbsp;&nbsp;[![CC BY-NC-SA 4.0][cc-by-nc-sa-shield]][cc-by-nc-sa]

The following license information applies to the texts in the [texts](./texts) folder.

[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License][cc-by-nc-sa].

[![CC BY-NC-SA 4.0][cc-by-nc-sa-image]][cc-by-nc-sa]

[cc-by-nc-sa]: http://creativecommons.org/licenses/by-nc-sa/4.0/
[cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png
[cc-by-nc-sa-shield]: https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg

## development

To run the app locally:

1. Install packages from the repository root directory
   > npm install
2. Run prebuild script
   > npm run prebuild
3. Run Next.js dev server
   > npm run dev

After making changes to the files in the `texts/` directory, you may need to **run the prebuild script again**.
