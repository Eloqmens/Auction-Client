# AuctionClient

Auction-Client is the client side of an online auction web application implemented in Angular. This project communicates with the server side **AuctionApi:** (https://github.com/Eloqmens/AuctionApi) via REST API and provides an interface for users and administrators.

## Technologies

- **Angular 18.1.4**
- **Bootstrap 5**
- **RxJS**
- **TypeScript**

## Project structure

- `src/app` - main folder with components, services, routes and models.
- `auth` - components and services for authentication and authorization.
- `lots` - components for working with lots (creating, viewing, editing, deleting).
- `admin` - components and routes for lot and category administration.
- `services` - services for interaction with API.

## Main functions

- **Lots View:** users can view available lots.
- **Bidding:** authorized users can bid on lots.
- **Authentication and Authorization:** support for logging in and registering new users.
- **Administration:** administrators can manage lots and categories through admin panel.
- **Lot Filtering:** users can filter lots by category.

## Installation and startup

1. Clone the repository:
    ```bash
    git clone https://github.com/Eloqmens/Auction-Client
    cd Auction-Client
    ```

2. Install dependencies:
    ````bash
    npm install
    ```

3. configure the URL API in ``environment.ts``:
    ````typescript
    export const environment = {
      production: false,
      apiUrl: 'https://localhost:7130/api'
    };
    ```

4. Run the project:
    ```bash
    ng serve
    ```

5. The application will be available at ``http://localhost:4200``.

## Administrator functionality

After logging in as an administrator, you will have an "Admin Panel" button where you will be able to:
- Create, edit and delete lots.
- Manage categories (add and delete them).

## Authorization

- A user with the `Admin` role has access to the Admin Panel.
- Normal users can view lots and place bids.

