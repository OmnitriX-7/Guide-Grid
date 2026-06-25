"use client";

interface StarRatingProps {
  rating: number;       // average rating (e.g. 4.3)
  count?: number;       // number of reviews
  size?: "sm" | "md" | "lg";
  interactive?: false;
}

interface InteractiveStarRatingProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  interactive: true;
  onRate: (rating: number) => void;
}

type Props = StarRatingProps | InteractiveStarRatingProps;

export default function StarRating(props: Props) {
  const { rating, size = "md" } = props;

  const sizeClass = {
    sm: "h-3.5 w-3.5",
    md: "h-4.5 w-4.5",
    lg: "h-6 w-6",
  }[size];

  const textSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }[size];

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.floor(rating);
        const partial = !filled && star === Math.ceil(rating) && rating % 1 !== 0;
        const fraction = rating % 1;

        return (
          <span
            key={star}
            onClick={() => {
              if (props.interactive && "onRate" in props) {
                props.onRate(star);
              }
            }}
            className={props.interactive ? "cursor-pointer" : ""}
          >
            {partial ? (
              // Partially filled star using a clip trick
              <span className="relative inline-block">
                {/* Gray background star */}
                <svg
                  className={`${sizeClass} text-gray-300`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {/* Partially filled yellow star clipped */}
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fraction * 100}%` }}
                >
                  <svg
                    className={`${sizeClass} text-yellow-400`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </span>
              </span>
            ) : (
              <svg
                className={`${sizeClass} ${filled ? "text-yellow-400" : "text-gray-300"} ${
                  props.interactive ? "hover:text-yellow-300 transition-colors" : ""
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            )}
          </span>
        );
      })}

      {/* Count badge */}
      {"count" in props && props.count !== undefined && (
        <span className={`${textSize} text-gray-500 ml-0.5`}>
          {rating > 0 ? (
            <>
              <span className="font-medium text-gray-700">{rating.toFixed(1)}</span>
              {" "}({props.count})
            </>
          ) : (
            "No reviews yet"
          )}
        </span>
      )}
    </div>
  );
}