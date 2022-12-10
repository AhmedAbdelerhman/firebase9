# firebase9 rules

// example for blog app
https://firebase.google.com/codelabs/firebase-rules#4
// test rules
https://firebase.blog/posts/2021/01/code-review-security-rules

// data base model
https://www.youtube.com/watch?v=lW7DWV2jST0&ab_channel=Firebase

service cloud.firestore {
  match /databases/{database}/documents {

    // Match any document in the 'cities' collection
    match /cities/{city} {
      allow read: if <condition>;
      allow write: if <condition>;
    }
  }
}




service cloud.firestore {
// match all database
  match /databases/{database}/documents {


// match supcollection
          match /sports/{id}/supSport/{sportId} {

           allow write: if request.auth != null;

           allow read : if true

        }

  }

}

//A read rule can be broken into get and list, while a write rule can be broken into create,
// update, and delete:

service cloud.firestore {
  match /databases/{database}/documents {
    // A read rule can be divided into get and list rules
    match /cities/{city} {
      // Applies to single document read requests
      allow get: if <condition>;

      // Applies to queries and collection read requests
      allow list: if <condition>;
    }

    // A write rule can be divided into create, update, and delete rules
    match /cities/{city} {
      // Applies to writes to nonexistent documents
      allow create: if <condition>;

      // Applies to writes to existing documents
      allow update: if <condition>;

      // Applies to delete operations
      allow delete: if <condition>;
    }
  }
}


//  Security rules apply only at the matched path, so the access controls defined on the cities
//   collection do not apply to the landmarks
//   subcollection. Instead, write explicit rules to control access to subcollections:

service cloud.firestore {
  match /databases/{database}/documents {
    match /cities/{city} {
      allow read, write: if <condition>;

        // Explicitly define rules for the 'landmarks' subcollection
        match /landmarks/{landmark} {
          allow read, write: if <condition>;
        }
    }
  }
}


// When nesting match statements, the path of the inner match statement is always relative to
//  the path of the outer match statement. The following rulesets are therefore equivalent:

service cloud.firestore {
  match /databases/{database}/documents {
    match /cities/{city} {
      match /landmarks/{landmark} {
        allow read, write: if <condition>;
      }
    }
  }
}


// or

service cloud.firestore {
  match /databases/{database}/documents {
    match /cities/{city}/landmarks/{landmark} {
      allow read, write: if <condition>;
    }
  }
}


// Recursive wildcards
// If you want rules to apply to an arbitrarily deep hierarchy,
//  use the recursive wildcard syntax, {name=**}. For example:



service cloud.firestore {
  match /databases/{database}/documents {
    // Matches any document in the cities collection as well as any document
    // in a subcollection.
    match /cities/{document=**} {
      allow read, write: if <condition>;
    }
  }
}



// if the secound match true it will be access the data even the first is flase
// so we can access path  /sports/{id}

service cloud.firestore {
  match /databases/{database}/documents {
    // Matches any document in the 'cities' collection.
    match  /sports/{id} {
      allow read, write: if false;
    }

    // Matches any document in the 'cities' collection or subcollections.
    match /sports/{document=**} {
      allow read, write: if true;
    }
  }
}


//**********************Authentication*********************

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow the user to access documents in the "cities" collection
    // only if they are authenticated.
    match /cities/{city} {
      allow read, write: if request.auth != null;
    }
  }
}



//make sure users can only read and write their own data:


service cloud.firestore {
  match /databases/{database}/documents {
    // Make sure the uid of the requesting user matches name of the user
    // document. The wildcard expression {userId} makes the userId variable
    // available in rules.
    match /users/{userId} {
      allow read, update, delete: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
    }
  }
}



//**************Access other documents*************

// Using the get() and exists() functions, your security rules can evaluate incoming
// requests against other documents in the database. The get() and exists() functions
//  both expect fully specified document paths. When using variables to construct paths for get()
// and exists(), you need to explicitly escape variables using the $(variable) syntax.

service cloud.firestore {
  match /databases/{database}/documents {
    match /cities/{city} {
      // Make sure a 'users' document exists for the requesting user before
      // allowing any writes to the 'cities' collection
      // note  request.auth.uid is the {city} variable
      allow create: if request.auth != null && exists(/databases/$(database)/documents/users/$(request.auth.uid))

      // Allow the user to delete cities if their user document has the
      // 'admin' field set to 'true'
      allow delete: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.admin == true
    }
  }
}



// *********************functions***********


// A function is defined with the function keyword and takes zero or more arguments. For example,
//  you may want to combine the two types of conditions used in the examples above into a single function:



service cloud.firestore {
  match /databases/{database}/documents {
    // True if the user is signed in or the requested data is 'public'
    function signedInOrPublic() {
      return request.auth.uid != null || resource.data.visibility == 'public';
    }

    match /cities/{city} {
      allow read, write: if signedInOrPublic();
    }

    match /users/{user} {
      allow read, write: if signedInOrPublic();
    }
  }
}


// NOTE
//1-you can access email
 request.auth.token.email

 //2-if you want to access incomming data user resource.data but
 // you have in the frontend request to write the path of doccment
 //ex         /sports/13564   not /sports/{id}


//-3 compere two times
 request.time === resource.data.createdAt

 //-4 size() to get the length of string

 resource.data.comment.size() >5


 // 5- if the request is update or create the request has object resource

 request.resource

//6- if you want to make data read by  google ueser signed
request.auth.token.firebase.sign_in_provider="google"

//7- validate the requred fields

request.resource.data.keys().hasAll({
  "comments",
  "title"
})

// 8- if you want to  make sure some fields not to changable

request.resource.data.diff(resource.data).unchangedKeys().hasAll({
  "createdAd",
  "ownerId"
})
// example for blog app
https://firebase.google.com/codelabs/firebase-rules#4
// test rules
https://firebase.blog/posts/2021/01/code-review-security-rules

//9- The business logic for comments is that they can be edited by the comment author for 
//a hour after creation. To implement this, use the createdAt timestamp.
(request.time - resource.data.createdAt) < duration.value(1, 'h');
allow update: if
  // is author
  request.auth.uid == resource.data.authorUID &&
  // within an hour of comment creation
  (request.time - resource.data.createdAt) < duration.value(1, 'h');
