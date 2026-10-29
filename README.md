# Fibre Sculpture Portfolio

A responsive, no-build product presentation for GitHub and Vercel. The project includes the supplied photos in the assets folder and a separate product list that can be edited without changing the page layout.

## Preview

Open index.html in a browser. The page uses local HTML, CSS, JavaScript, and image files; it does not require a framework or build step.

## Update the collection

Edit products.js to change a product name, category, description, or gallery photos. Product details are stored separately from the design.

To add a product:

1. Copy its photo or photos into the assets folder.
2. Add a new object to the PRODUCTS list in products.js.
3. Use a unique lowercase id and one of these categories: heritage, devotional, wildlife, objects, or sculptural.
4. Put each photo filename in the images list.

Each product supports these optional fields:

- material: product material, shown when supplied
- sizes: list of sizes, for example ["12 in", "18 in"]
- price: one numeric price
- priceNote: text such as "Price on request"
- variants: size-specific prices

Example product with different sizes and prices:

    {
      id: "sample-statue",
      name: "Sample Statue",
      category: "heritage",
      description: "A short product description.",
      images: ["sample-statue-front.jpg", "sample-statue-side.jpg"],
      material: "Fibre",
      sizes: ["12 in", "18 in"],
      price: null,
      priceNote: "",
      variants: [
        { size: "12 in", price: 4500 },
        { size: "18 in", price: 7200 }
      ]
    }

Prices and sizes are hidden when left blank. The page does not invent missing product details. The source photos in the original folder are unchanged; the assets folder contains web-sized copies.

## Change the brand and enquiry destination

Edit site-config.js:

- brandName changes the name in the header and browser title.
- tagline changes the small line below the brand name in the header.
- logoImage is an optional image filename to place in the assets folder, such as brand-logo.png.
- showBrandName can be set to false when the uploaded logo already contains the brand name.
- currency uses an ISO code such as INR or USD.
- whatsappNumber takes digits only with country code, for example 919876543210.
- email adds an email enquiry option.

If WhatsApp and email are blank, the enquiry button prepares a message the customer can share or copy.

The copy object in site-config.js lets you edit the main headline and landing-page text. Product names, descriptions, photos, sizes, and prices stay in products.js.

## Push to GitHub

Create an empty GitHub repository. In a terminal opened inside this folder, run:

    git init
    git add .
    git commit -m "Add fibre sculpture portfolio"
    git branch -M main
    git remote add origin YOUR_GITHUB_REPOSITORY_URL
    git push -u origin main

Alternatively, upload the contents of this folder to a new GitHub repository using GitHub's web interface.

## Connect GitHub to Vercel

In Vercel, import the GitHub repository. This is a plain static site, so choose Other if a framework preset is requested and leave the build and install commands blank. The project root contains index.html and needs no build step. Once connected, later pushes to the selected GitHub branch can trigger a fresh deployment.

Official Vercel guides:

- https://vercel.com/docs/deployments
- https://vercel.com/docs/builds
