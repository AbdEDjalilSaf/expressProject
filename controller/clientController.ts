import * as clientService from "../services/clientServices";
import { Request, Response } from "express";
import bcrypt from 'bcrypt';
import { query } from "../db";
import jwt from 'jsonwebtoken';






export const getClients = async (req: Request, res: Response) => {

if(req.query.q){
    const clients = await clientService.searchClients(req.query.q as string);
    res.status(200).json(clients);
}
else{
    try {
        const clients = await clientService.getClients();
        res.status(200).json(clients);
    } catch (err) { 
        console.error('Error fetching clients:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
}


// export const createClient = async (req: Request, res: Response) => {
// //     if(req.body){
// //         const clientData = req.body;
// //         const data = matchedData(clientData);
// //         const result = validationResult(req);
// //       console.log("result",result);
// //         if(!result.isEmpty()){
// //           res.status(400).send({ errors: result.array() });
// //           return;
// //         }
      
// //       const newAddUser = await clientService.createClient(data);
// //       data.password = await hashPassword(data.password);
// //       console.log("data",data);
// //       try {
// //         await newAddUser.save()
// //         .then(() => console.log("Client saved successfully"))
// //         .catch((err: Error) => console.error("Error saving client:", err)); 
      
// //         res.status(201).send(newAddUser);
// //       } catch(err: any) {
// //         console.log("Error ---------------- ",err);
// //         res.status(400).send({error: (err as Error).message});
// //         return;
// //       }

// //     // try {
// //     //     const clientData = req.body;
// //     //     const newClient = await clientService.createClient(clientData);
// //     //     console.log("New Client:", newClient); 
// //     //     res.status(200).json(newClient);
// //     // } catch (err) { 
// //     //     console.error('Error adding client:', err);
// //     //     res.status(500).json({ message: 'Internal Server Error' });
// //     // }
// // }

// const {client_id, first_name, last_name, email, password_hash, isactive} = req.body;

// const reqData = matchedData(req.body);
// const result = validationResult(req);

// console.log("result",result);
// console.log("reqData",reqData);

// if (!email || !password_hash || !first_name || !last_name ) {
//     res.status(400).json({ 'message': 'Username and password are required.' });
//     return;
// }

// const foundUser = await clientService.getUserByEmail(email);
// if (foundUser) {
//     res.status(400).json({ 'message': 'User already exists.' });
//     return;
// }

// const match = await bcrypt.compare(password_hash, foundUser.password);
// console.log("match",match);


// if(match){
//     const hashedPassword = await hashPassword(password_hash);

// const roles = Object.values(foundUser.roles || {}).filter(Boolean);

// const 

//     const data = {
//         client_id,
//         first_name,
//         last_name,
//         email,
//         password_hash: hashedPassword,
//         isactive
//     };

//     const accessToken = jwt.sign(
//         {
//           "UserInfo": {
//             "username": foundUser.name,
//             "roles": roles
//           }
//         },
//         SECRET_KEY,
//         { expiresIn: "20m" }
//       );
  
//       const newRefreshToken = jwt.sign(
//         { "username": foundUser.name },
//         SECRET_KEY,
//         { expiresIn: '30d' }
//       );

//       res.status(200).json({
//         accessToken,
//         refreshToken: newRefreshToken
//       });
    
// }
// };



// Register new user
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    

    // Save user to database
    const { rows } = await query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
      [username, email, passwordHash]
    );
    
    // Create JWT
    const accessToken = jwt.sign({ id: rows[0].id }, process.env.JWT_SECRET as string, {
      expiresIn: "20m",
    });
    
    const refreshToken = jwt.sign({ id: rows[0].id }, process.env.JWT_SECRET as string, {
      expiresIn: "30d",
    });
    
    res.status(201).json(
        {
        "meta": "",
        "succeeded": true,
        "message": "User registered successfully",
        "data":
            { 
                user: rows[0],
                "jwtAuthResult": { 
                    accessToken, refreshToken 
                } 
            }
  });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};




// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, rows[0].password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
  // Create JWT
  const accessToken = jwt.sign({ id: rows[0].id }, process.env.JWT_SECRET as string, {
    expiresIn: "20m",
  });
  
  const refreshToken = jwt.sign({ id: rows[0].id }, process.env.JWT_SECRET as string, {
    expiresIn: "30d",
  });
  
  res.status(201).json(
      {
      "meta": "",
      "succeeded": true,
      "message": "User logged in successfully",
      "data":
          { 
            user: rows[0], 
            "jwtAuthResult": { 
                accessToken, refreshToken 
            } }
});

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};




// Get current user
export const getMe = async (req: Request, res: Response) => {
    // Add this check at the start of your controller
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
  
    try {
      const { rows } = await query(
        'SELECT id, username, email FROM users WHERE id = $1',
        [req.user.id]  // Now TypeScript knows req.user exists
      );
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(rows[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };



export const updateClient = async (req: Request, res: Response) => {
    
    try {
        const clientId = req.params.id;
        const clientData = req.body;
        const updatedClient = await clientService.updateClient(clientId, clientData);
        if (!updatedClient) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.status(200).json(updatedClient);

    } catch (err: any) { 
        console.error('Error updating client:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


export const deleteClient = async (req: Request, res: Response) => {
    try {
        const clientId = req.params.id;
        const deleted = await clientService.deleteClient(clientId);
        if (!deleted) {
        return res.status(404).json({ message: 'Client not found' });
        }

        res.status(200).send();

    } catch (err: any) { 
        console.error('Error deleting client:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


export const searchClients = async (req: Request, res: Response) => {
    try {
      const searchTerm = req.query.q; // Get the search term from the query parameters
      const clients = await clientService.searchClients(searchTerm);
      res.status(200).json(clients);
    } catch (error: any) {
      console.error('Error searching clients:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  